const { UserController } = require("../../controllers");
const { FirebaseAuth } = require("../../middlewares");

const express = require("express");
const router = express.Router();

router.post("/create-user", UserController.createUser);
router.get("/info", FirebaseAuth.verifyFirebaseToken, UserController.info);

module.exports = router;
