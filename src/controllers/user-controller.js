const { UserService } = require("../services");
const { SuccessResponse, ErrorResponse, Enums } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");

const { PATIENT } = Enums.ROLES;

async function createUser(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    if (!role || role.toLowerCase() !== PATIENT.toLowerCase()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Only Patient role is allowed for signup",
      });
    }

    const response = await UserService.createUser({
      fullName,
      email,
      password,
      role: PATIENT,
    });

    SuccessResponse.data = response;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}

module.exports = {
  createUser,
};
