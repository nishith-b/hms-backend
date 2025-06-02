const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.DB_URL) {
  console.error("Missing DB_URL in environment variables");
  process.exit(1);
}

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};
