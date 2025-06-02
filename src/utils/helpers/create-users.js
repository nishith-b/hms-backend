const admin = require("firebase-admin");

const serviceAccount = require("../../../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createUserWithRole(email, password, role) {
  try {
    const user = await admin.auth().createUser({ email, password });

    await admin.auth().setCustomUserClaims(user.uid, { role });

    console.log(`✅ Created user: ${email} with role: ${role}`);
  } catch (error) {
    console.error(`❌ Error for ${email}:`, error.message);
  }
}

(async () => {
  await createUserWithRole("doctor1@hospital.com", "strongpassword", "doctor");
  await createUserWithRole("admin@hospital.com", "adminpass123", "admin");
})();
