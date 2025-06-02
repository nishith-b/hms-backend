const { AuthController } = require("../../controllers");

const express = require("express");
const router = express.Router();

router.post("/", AuthController.signupPatient);

module.exports = router;
