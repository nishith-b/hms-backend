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
  await createUserWithRole("doctor1@hospital.com", "doctor123", "doctor");
  await createUserWithRole("admin@hospital.com", "admin123", "admin");
  await createUserWithRole("nurse1@hospital.com", "nurse123", "nurse");
  await createUserWithRole("pharmacist1@hospital.com", "pharma123", "pharmacist");
  await createUserWithRole("receptionist1@hospital.com", "reception123", "receptionist");

  // Optional: test patient (patients usually sign up themselves)
  await createUserWithRole("patient1@hospital.com", "patient123", "user");
})();
