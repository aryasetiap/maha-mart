const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Fungsi untuk menghasilkan token
const generateToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate a token");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Fungsi untuk memverifikasi token
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required to verify");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token", { cause: error });
  }
};

module.exports = { generateToken, verifyToken };
