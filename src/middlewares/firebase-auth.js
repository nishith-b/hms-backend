const { FirebaseConfig } = require("../config");
const admin = FirebaseConfig.admin;

async function verifyFirebaseToken(req, res, next) {
  const token = req.cookies.idToken;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // attach decoded info to request
    next(); // proceed
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { verifyFirebaseToken };
