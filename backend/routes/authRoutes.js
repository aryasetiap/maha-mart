// authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authMiddleware, authController.resetPassword);

module.exports = router;
