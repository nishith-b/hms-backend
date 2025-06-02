const { InfoController } = require("../../controllers");

const express = require("express");
const router = express.Router();

const userRoutes = require("./user-routes");
const authRoutes = require("./auth-routes");

router.get("/info", InfoController.info);

router.use("/signup", authRoutes);

module.exports = router;
