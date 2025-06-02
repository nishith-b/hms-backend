const bcrypt = require("bcryptjs");
const { UserRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

const userRepository = new UserRepository();

async function createUser({ fullName, email, password, role }) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userRepository.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    return newUser;
  } catch (error) {
    console.error("Error in createUser service:", error);

    throw new AppError(
      "Cannot create a user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createUser,
};
