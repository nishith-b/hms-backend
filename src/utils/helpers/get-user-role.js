// getUserRoleScript.js
const { getUserRole } = require("../helpers/firebase-auth");

// Replace with a valid Firebase UID
const uid = "lZ41recJHtURaVq7s9o9j8ySxQ22";

(async () => {
  try {
    const role = await getUserRole(uid);
    console.log(`✅ Role for UID ${uid}: ${role}`);
  } catch (error) {
    console.error("❌ Failed to get user role:", error.message);
  }
})();
