/**
 * Handles CRUD operations for products.
 */

const { pool } = require("../db/postgres");

/**
 * Creates a new product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const createProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!name || !description || !price || !stock) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, price, stock, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * Retrieves a list of all products with optional pagination.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      "SELECT * FROM products LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Retrieves a single product by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

/**
 * Updates a single product by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (!name || !description || !price || !stock) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let query;
    let values;

    if (imageUrl) {
      query =
        "UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5 WHERE id = $6 RETURNING *";
      values = [name, description, price, stock, imageUrl, id];
    } else {
      query =
        "UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *";
      values = [name, description, price, stock, id];
    }

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * Deletes a single product by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

