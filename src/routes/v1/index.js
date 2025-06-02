const { InfoController } = require("../../controllers");

const express = require("express");
const router = express.Router();

const signupRoutes = require("./signup-routes");
const authRoutes = require("./auth-routes");

router.get("/info", InfoController.info);

router.use("/signup", signupRoutes);

router.use("/signin", authRoutes);

module.exports = router;
