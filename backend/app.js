const express = require("express");
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing
const mongoose = require("./db/mongo"); // MongoDB configuration
const { pool } = require("./db/postgres"); // PostgreSQL configuration
const authRoutes = require("./routes/auth");

/**
 * The Express application instance.
 */
const app = express();

/**
 * The port number to listen on.
 */
const PORT = process.env.PORT || 5000;

if (!PORT) {
  throw new Error("PORT is not defined");
}

/**
 * Middleware to parse JSON requests and enable CORS.
 */
app.use(express.json());
app.use(cors());

/**
 * Logging middleware.
 */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/**
 * The routes for the application.
 */
app.use("/api/auth", authRoutes);

/**
 * Error handling middleware.
 */
app.use((err, req, res, next) => {
  console.error("Error handling request:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/**
 * Start the server.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Test connection to PostgreSQL.
 */
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
    return;
  }
  console.log("Connected to PostgreSQL");
  release(); // Release the client back to the pool
});

/**
 * Test connection to MongoDB.
 */
mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoDB");
  })
  .on("error", (err) => {
    console.error("Error connecting to MongoDB:", err);
  });
