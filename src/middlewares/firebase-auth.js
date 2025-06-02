const admin = require("../config/firebase-config");

async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
module.exports = {
  verifyFirebaseToken,
};
