const axios = require("axios");
const { FirebaseConfig } = require("../config");
const { StatusCodes } = require("http-status-codes");

const admin = FirebaseConfig.admin;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Utility: Create secure auth cookie
 */
const setAuthCookie = (res, idToken) => {
  res.cookie("token", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Signup a patient (only role allowed to register directly)
 */
async function signupPatient(req, res) {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Email, password, and fullName are required",
    });
  }

  try {
    // Check for existing user
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User already exists",
        user: existingUser.toJSON(),
      });
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Error checking existing user",
          error: err.message,
        });
      }
    }

    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    const uid = userRecord.uid;
    const role = "patient";

    // Set custom role claim
    await admin.auth().setCustomUserClaims(uid, { role });

    // Save user to Firestore
    const db = admin.firestore();
    await db.collection("users").doc(uid).set({
      uid,
      email,
      fullName,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Force sign in to get token with updated claims
    const loginResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const idToken = loginResponse.data.idToken;

    // Force token refresh to get custom claims
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    setAuthCookie(res, idToken);

    return res.status(StatusCodes.CREATED).json({
      message: "Patient signed up and logged in successfully",
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Signup failed",
      error: error.message,
    });
  }
}

/**
 * Shared login logic for all roles
 */
async function handleRoleBasedLogin(req, res, expectedRole) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Email and password required",
    });
  }

  try {
    // Authenticate using Firebase REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );

    const idToken = response.data.idToken;

    // Verify ID token and check role
    const decoded = await admin.auth().verifyIdToken(idToken, true);

    if (decoded.role !== expectedRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: `Access denied. Not a ${expectedRole}.`,
      });
    }

    setAuthCookie(res, idToken);

    return res.status(StatusCodes.OK).json({
      message: `${expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} login successful`,
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error(`${expectedRole} login failed:`, error.response?.data || error.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid credentials",
    });
  }
}

// Role-based login endpoints
const handleDoctorLogin = (req, res) => handleRoleBasedLogin(req, res, "doctor");
const handleAdminLogin = (req, res) => handleRoleBasedLogin(req, res, "admin");
const handleNurseLogin = (req, res) => handleRoleBasedLogin(req, res, "nurse");
const handlePharmacistLogin = (req, res) => handleRoleBasedLogin(req, res, "pharmacist");
const handleReceptionistLogin = (req, res) => handleRoleBasedLogin(req, res, "receptionist");
const handlePatientLogin = (req, res) => handleRoleBasedLogin(req, res, "patient");

// Export
module.exports = {
  signupPatient,
  handleDoctorLogin,
  handleAdminLogin,
  handleNurseLogin,
  handlePharmacistLogin,
  handleReceptionistLogin,
  handlePatientLogin,
};
