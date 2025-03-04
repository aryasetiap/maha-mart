// 1. Import modul yang diperlukan
const express = require("express");
const cors = require("cors"); // Middleware untuk mengizinkan Cross-Origin Resource Sharing
const mongoose = require("./db/mongo"); // Konfigurasi MongoDB
const pool = require("./db/postgres"); // Konfigurasi PostgreSQL

// 2. Inisialisasi aplikasi Express
const app = express();

// 3. Middleware
app.use(cors()); // Mengizinkan request dari frontend
app.use(express.json()); // Mengizinkan parsing JSON dari request body

// 4. Rute (Endpoints)
// Contoh endpoint sederhana untuk memastikan backend berfungsi
app.get("/", (req, res) => {
  res.send("Selamat datang di backend MahaMart!");
});

// 5. Koneksi ke database
// Tes koneksi PostgreSQL
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to PostgreSQL:", err);
  } else {
    console.log("Connected to PostgreSQL");
  }
});

// Tes koneksi MongoDB
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// 6. Jalankan server
const PORT = process.env.PORT || 5000; // Gunakan port dari environment atau default 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});