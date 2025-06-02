const { createUserWithRole } = require("../utils/helpers/firebase-auth");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");

async function patientSignup(req, res) {
  const { email, password } = req.body;

  try {
    const user = await createUserWithRole(email, password, "patient");

    SuccessResponse.data = {
      message: "Signup successful",
      uid: user.uid,
    };

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.error(error);
    ErrorResponse.error = error.message;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  patientSignup,
};
