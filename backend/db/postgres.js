console.log("PostgreSQL connection file executed");

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mahamart",
  password: "arya19032004A*",
  port: 5432,
});

// Fungsi untuk hashing password
const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error("Password is required to hash");
    }

    const salt = await bcrypt.genSalt(10);
    if (!salt) {
      throw new Error("Failed to generate salt");
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    if (!hashedPassword) {
      throw new Error("Failed to hash password");
    }

    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

// Fungsi untuk membandingkan password
const comparePassword = async (password, hashedPassword) => {
  if (!password) {
    throw new Error("Password is required to compare");
  }

  if (!hashedPassword) {
    throw new Error("Hashed password is required to compare");
  }

  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (typeof isMatch !== "boolean") {
      throw new Error("Unexpected result from password comparison");
    }
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw new Error("Failed to compare password", { cause: error });
  }
};

// Ekspor semua fungsi dan objek yang dibutuhkan
module.exports = { pool, hashPassword, comparePassword };
