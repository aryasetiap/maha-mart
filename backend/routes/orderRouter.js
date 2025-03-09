/**
 * Routes for orders.
 *
 * @module routes/orderRouter
 */

const express = require("express");
const router = express.Router();
const ordercontroller = require("../controllers/orderController");
const { body, validationResult, query } = require("express-validator");

/**
 * Validates the request body for creating an order.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const createOrderValidation = [
  body("id_user")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID")
    .not()
    .isEmpty()
    .withMessage("User ID is required"),
  body("id_product")
    .isInt({ min: 1 })
    .withMessage("Invalid product ID")
    .not()
    .isEmpty()
    .withMessage("Product ID is required"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be positive")
    .not()
    .isEmpty()
    .withMessage("Quantity is required"),
];

/**
 * Endpoint untuk membuat pesanan.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.post(
  "/",
  createOrderValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  ordercontroller.createOrder
);

/**
 * Validates the request query for getting orders.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const getOrdersValidation = [
  query("user_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
];

/**
 * Endpoint untuk melihat daftar pesanan.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.get(
  "/",
  getOrdersValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  ordercontroller.getOrders
);

/**
 * Validates the request body for updating an order status.
 *
 * @type {import('express-validator').ValidationChain[]}
 */
const updateOrderStatusValidation = [
  body("status")
    .isIn(["pending", "shipped", "delivered", "canceled"])
    .withMessage("Invalid status"),
];

/**
 * Endpoint untuk mengubah status pesanan.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function in the middleware chain.
 */
router.put(
  "/:id",
  updateOrderStatusValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  ordercontroller.updateOrderStatus
);

module.exports = router;

