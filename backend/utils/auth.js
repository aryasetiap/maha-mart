const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Generates a JWT token for a user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated JWT token.
 * @throws {Error} If the userId is not provided or is invalid.
 * @throws {Error} If the JWT secret or expiration time is not set in the environment.
 */
const generateToken = (userId) => {
  if (!userId || typeof userId !== "string") {
    throw new Error(
      "User ID is required to generate a token and must be a string"
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is required to generate a token");
  }

  if (!process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT expiration time is required to generate a token");
  }

  // Sign and return the token with the user ID as payload
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT token.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {object} The decoded token payload if verification is successful.
 * @throws {Error} If the token is not provided, is invalid, or has expired.
 */
const verifyToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Token is required to verify and must be a string");
  }

  try {
    // Verify the token and return the decoded payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token");
    }
    return decoded;
  } catch (error) {
    // Handle specific JWT errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw new Error("Invalid token", { cause: error });
    }
    throw error;
  }
};

module.exports = { generateToken, verifyToken };
