const mongoose = require("mongoose");
const { Enums } = require("../utils/common");

const { DOCTOR, PATIENT, PHARMACY, RECEPTIONIST, NURSE, ADMIN } = Enums.ROLES;

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [ADMIN, DOCTOR, PATIENT, PHARMACY, RECEPTIONIST, NURSE],
    required: true,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
