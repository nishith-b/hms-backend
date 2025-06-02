const { FirebaseConfig } = require("../../config");
const admin = FirebaseConfig;

async function createUserWithRole(email, password, role) {
  try {
    const user = await admin.auth().createUser({ email, password });
    await admin.auth().setCustomUserClaims(user.uid, { role });
    return user;
  } catch (error) {
    console.error("Error creating user with role:", error);
    throw error;
  }
}

async function getUserRole(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    return user.customClaims?.role || "unknown";
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
}

module.exports = {
  createUserWithRole,
  getUserRole,
};
