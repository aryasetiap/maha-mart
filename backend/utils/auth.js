const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Generates a JWT token for a user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated JWT token.
 * @throws {Error} If the userId is not provided.
 */
const generateToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate a token");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT token.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {object} The decoded token payload if verification is successful.
 * @throws {Error} If the token is not provided or is invalid.
 */
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

