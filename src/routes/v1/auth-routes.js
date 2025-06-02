const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers");

router.post("/user", (req, res) =>
  AuthController.handleDoctorLogin(req, res, "patient")
);

// Doctor login route
router.post("/doctor", (req, res) =>
  AuthController.handleLogin(req, res, "doctor")
);

// Admin login route
router.post("/admin", (req, res) =>
  AuthController.handleLogin(req, res, "admin")
);

module.exports = router;
