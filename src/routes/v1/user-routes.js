const { UserController } = require("../../controllers");

const express = require("express");
const router = express.Router();

router.post("/create-user", UserController.createUser);

module.exports = router;
