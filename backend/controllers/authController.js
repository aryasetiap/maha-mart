// authController.js
/**
 * Controller for authentication-related operations.
 * Handles user registration, login, Google login, and password reset.
 */

const { pool, hashPassword, comparePassword } = require("../db/postgres");
const { generateToken, verifyToken } = require("../utils/auth");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    if (!process.env.GOOGLE_CLIENT_ID)
      return res.status(500).json({ error: "Google Client ID is not set" });

    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );
    if (!result.rows[0]?.id)
      return res.status(500).json({ error: "User registration failed" });
    res.status(201).json({
      message: "User registered",
      token: generateToken(result.rows[0].id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * Logs in an existing user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res
      .status(200)
      .json({ message: "Login successful", token: generateToken(user.id) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Logs in a user with Google OAuth.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.googleLogin = async (req, res) => {
  const { tokenId } = req.body;
  if (!tokenId) return res.status(400).json({ error: "Token ID is required" });

  try {
    if (!process.env.GOOGLE_CLIENT_ID)
      return res.status(500).json({ error: "Google Client ID is not set" });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const email = ticket.getPayload()?.email;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      userResult = await pool.query(
        "INSERT INTO users (email) VALUES ($1) RETURNING *",
        [email]
      );
      if (!userResult.rows[0]?.id)
        return res.status(500).json({ error: "User creation failed" });
    }

    res.status(200).json({
      message: "Google login successful",
      token: generateToken(userResult.rows[0]?.id),
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Google login failed" });
  }
};

/**
 * Sends a password reset email to the user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      return res.status(500).json({ error: "Email credentials are not set" });

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const resetLink = `http://your-frontend-url/reset-password?token=${generateToken(
      userResult.rows[0].id
    )}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Klik link berikut untuk reset password: ${resetLink}`,
    });

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Failed to send reset password email" });
  }
};

/**
 * Resets the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res
      .status(400)
      .json({ error: "Token and new password are required" });

  try {
    const decoded = verifyToken(token);
    if (!decoded?.id) return res.status(401).json({ error: "Invalid token" });

    const hashedPassword = await hashPassword(newPassword);
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, decoded.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};
