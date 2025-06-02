const axios = require("axios");
const { FirebaseConfig } = require("../config");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

const admin = FirebaseConfig.admin;

const COOKIE_NAME = "idToken";
const COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Signup a patient (the only role allowed to register directly).
 */
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
      const response = await admin.auth().getUserByEmail(email);
      SuccessResponse.data = response;
      return res.status(StatusCodes.BAD_REQUEST).json({ SuccessResponse });
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
    const role = "patient"; // use lowercase for consistency

    // Set custom claim
    await admin.auth().setCustomUserClaims(uid, { role });

    // Store user data in Firestore
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

/**
 * Shared login logic for all roles.
 */
async function handleRoleBasedLogin(req, res, expectedRole) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Email and password required" });
  }

  try {
    // Step 1: Authenticate via Firebase Auth REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;

    // Step 2: Verify the ID token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Step 3: Check role match
    if (decoded.role !== expectedRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: `Access denied. Not a ${expectedRole}.`,
      });
    }

    // Step 4: Set session token in secure cookie
    res.cookie(COOKIE_NAME, idToken, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Step 5: Respond with user info
    return res.status(StatusCodes.OK).json({
      message: `${
        expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)
      } login successful`,
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error(
      `${expectedRole} login failed:`,
      error.response?.data || error.message
    );
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid credentials" });
  }
}

// Role-based login handlers
const handleDoctorLogin = (req, res) =>
  handleRoleBasedLogin(req, res, "doctor");
const handleAdminLogin = (req, res) => handleRoleBasedLogin(req, res, "admin");
const handleNurseLogin = (req, res) => handleRoleBasedLogin(req, res, "nurse");
const handlePharmacistLogin = (req, res) =>
  handleRoleBasedLogin(req, res, "pharmacist");
const handleReceptionistLogin = (req, res) =>
  handleRoleBasedLogin(req, res, "receptionist");
const handlePatientLogin = (req, res) =>
  handleRoleBasedLogin(req, res, "patient");
module.exports = {
  signupPatient,
  handleDoctorLogin,
  handleAdminLogin,
  handleNurseLogin,
  handlePharmacistLogin,
  handleReceptionistLogin,
  handlePatientLogin,
};
