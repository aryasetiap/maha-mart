/**
 * The main application file.
 *
 * This file sets up the Express server and defines the routes.
 *
 * @module app
 */

const express = require("express");
const cors = require("cors");
const mongoose = require("./db/mongo");
const { pool } = require("./db/postgres");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const path = require("path");

/**
 * The Express app instance.
 *
 * @type {Express}
 */
const app = express();

/**
 * The port number to listen on.
 *
 * @type {number}
 */
const PORT = process.env.PORT || 5000;

/**
 * Middlewares
 */

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log each request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/**
 * Routes
 */

// Auth routes
app.use("/api/auth", authRoutes);

// Product routes
app.use("/api/products", productRoutes);

/**
 * Error handling
 */

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error("Error handling request:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Connect to PostgreSQL
 */
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
    return;
  }
  console.log("Connected to PostgreSQL");
  release();
});

/**
 * Connect to MongoDB
 */
mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoDB");
  })
  .on("error", (err) => {
    console.error("Error connecting to MongoDB:", err);
  });

