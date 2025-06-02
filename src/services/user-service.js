const bcrypt = require("bcryptjs");
const { UserRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

const userRepository = new UserRepository();

async function createUser(data) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const user = await userRepository.create(data);
    return user;
  } catch (error) {
    console.log(error);
    throw new AppError(
      "Cannot create a user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createUser,
};
