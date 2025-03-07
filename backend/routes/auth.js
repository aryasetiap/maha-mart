/**
 * This file contains the API endpoints for authentication.
 *
 * @module auth
 */

const express = require("express");
const router = express.Router();
const { pool, hashPassword, comparePassword } = require("../db/postgres");
const { generateToken, verifyToken } = require("../auth");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Creates a nodemailer transporter for sending emails.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ error: "User registration failed" });
    }

    if (!result.rows[0].id) {
      return res.status(500).json({ error: "User registration failed" });
    }

    const token = generateToken(result.rows[0].id);
    res.status(201).json({ message: "User registered", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * Logs in a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (!user || !user.password) {
      throw new Error("Internal server error");
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Internal server error") {
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.status(500).json({ error: "Login failed" });
    }
  }
});

/**
 * Handles Google OAuth login.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/google-login", async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    return res.status(400).json({ error: "Token ID is required" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      try {
        user = await pool.query(
          "INSERT INTO users (email) VALUES ($1) RETURNING *",
          [email]
        );
      } catch (error) {
        console.error("Error inserting new user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    const token = generateToken(user.rows[0]?.id);

    if (!token) {
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json({ message: "Google login successful", token });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Google login failed" });
  }
});

/**
 * Handles forgot password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!userResult || userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0]?.id;
    if (!userId) {
      return res.status(500).json({ error: "Internal server error" });
    }

    const resetLink = `http://your-frontend-url/reset-password?token=${generateToken(
      userId
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
});

/**
 * Handles reset password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const hashedPassword = await hashPassword(newPassword);

    if (!hashedPassword) {
      throw new Error("Failed to hash new password");
    }

    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, decoded.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

module.exports = router;
