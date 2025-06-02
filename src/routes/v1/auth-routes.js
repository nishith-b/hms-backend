const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers");

router.post("/doctor-login", AuthController.handleDoctorLogin);
router.post("/user-login", AuthController.handlePatientLogin);
router.post("/admin-login", AuthController.handleAdminLogin);
router.post("/nurse-login", AuthController.handleNurseLogin);
router.post("/pharmacist-login", AuthController.handlePharmacistLogin);
router.post("/receptionist-login", AuthController.handleReceptionistLogin);

module.exports = router;
