// authRoutes.js
/**
 * Authentication routes for the API.
 *
 * @module routes/authRoutes
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post("/register", (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  next();
}, authController.register);

/**
 * Logs in an existing user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post("/login", (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  next();
}, authController.login);

/**
 * Logs in an existing user using Google OAuth.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post("/google-login", (req, res, next) => {
  if (!req.body.tokenId) {
    return res.status(400).json({ error: "Token ID is required" });
  }
  next();
}, authController.googleLogin);

/**
 * Sends a password reset email to the user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post("/forgot-password", (req, res, next) => {
  if (!req.body.email) {
    return res.status(400).json({ error: "Email is required" });
  }
  next();
}, authController.forgotPassword);

/**
 * Resets the user's password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post("/reset-password", authMiddleware, (req, res, next) => {
  if (!req.body.password || !req.body.confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password are required" });
  }
  next();
}, authController.resetPassword);

module.exports = router;

