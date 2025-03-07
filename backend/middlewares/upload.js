/**
 * Multer middleware for handling file uploads.
 *
 * @module upload
 */

const multer = require("multer");
const path = require("path");

/**
 * Storage configuration for Multer.
 *
 * @typedef {Object} Storage
 * @property {string} destination - Destination directory for uploaded files.
 * @property {string} filename - Filename for uploaded files.
 */
const storage = multer.diskStorage({
  /**
   * Destination directory for uploaded files.
   *
   * @param {Request} req - The request object.
   * @param {File} file - The file being uploaded.
   * @param {Callback} callback - Callback function.
   */
  destination: (_, __, callback) => {
    callback(null, "uploads/");
  },
  /**
   * Filename for uploaded files.
   *
   * @param {Request} req - The request object.
   * @param {File} file - The file being uploaded.
   * @param {Callback} callback - Callback function.
   */
  filename: (_, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

/**
 * Multer middleware for handling file uploads.
 *
 * @type {Multer}
 */
const uploadMiddleware = multer({ storage });

module.exports = uploadMiddleware;

