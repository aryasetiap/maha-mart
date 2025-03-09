/**
 * Handles CRUD operations for orders.
 * @module controllers/orderController
 */

const { pool } = require("../db/postgres");
const { body, validationResult } = require("express-validator");

/**
 * Creates a new order.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id_user, id_product, quantity } = req.body;

  if (!id_user || !id_product || !quantity) {
    return res
      .status(400)
      .json({ error: "id_user, id_product, and quantity are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO orders (id_user, id_product, quantity) VALUES ($1, $2, $3) RETURNING *",
      [id_user, id_product, quantity]
    );
    if (!result.rows[0]) {
      return res.status(500).json({ error: "Failed to create order" });
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "User or product not found" });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
};

/**
 * Retrieves a list of all orders with optional pagination.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const getOrders = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id } = req.query; // Ambil parameter query `user_id`

  try {
    let query =
      "SELECT orders.id, users.email AS user_email, products.name AS product_name, orders.quantity, orders.status FROM orders JOIN users ON orders.id_user = users.id JOIN products ON orders.id_product = products.id";
    let values = [];

    if (user_id) {
      query += " WHERE orders.id_user = $1"; // Filter berdasarkan `id_user`
      values.push(user_id);
    }

    const result = await pool.query(query, values);
    if (!result.rows.length) {
      return res.status(404).json({ error: "Orders not found" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * Updates the status of an order by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: "id and status are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
