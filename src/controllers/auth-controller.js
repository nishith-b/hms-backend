const { FirebaseConfig } = require("../config");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");

const admin = FirebaseConfig.admin;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY

async function signupPatient(req, res) {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Email, password, and fullName are required",
    });
  }

  try {
    // Check if user already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email already registered",
      });
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Error checking existing user",
          error: err.message,
        });
      }
      // Safe to continue
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    const uid = userRecord.uid;
    const role = "Patient";

    await admin.auth().setCustomUserClaims(uid, { role });

    const db = admin.firestore();
    await db.collection("users").doc(uid).set({
      uid,
      email,
      fullName,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Patient signed up successfully",
      uid,
      role,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Signup failed",
      error: error.message,
    });
  }
}

async function handleLogin(req, res, expectedRole) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, role } = decodedToken;

    if (!role || role !== expectedRole) {
      return res
        .status(403)
        .json({ message: `Access denied for role: ${role || "none"}` });
    }

    return res.status(200).json({
      message: `Login successful as ${role}`,
      user: {
        uid,
        email,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function handleDoctorLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    // 🔸 1. Sign in using Firebase Auth REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;

    // 🔸 2. Verify token using Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // 🔸 3. Check custom role
    if (decoded.role !== "doctor") {
      return res.status(403).json({ message: "Access denied. Not a doctor." });
    }

    res.status(200).json({
      message: "Doctor login successful",
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      idToken,
    });
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return res.status(401).json({ message: "Invalid credentials" });
  }
}

module.exports = { signupPatient, handleLogin, handleDoctorLogin };
