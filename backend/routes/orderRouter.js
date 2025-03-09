const express = require("express");
const router = express.Router();
const ordercontroller = require("../controllers/orderController");
const { body, validationResult, query } = require("express-validator");

// Endpoint untuk membuat pesanan
router.post(
  "/",
  [
    body("id_user").isInt({ min: 1 }).withMessage("Invalid user ID"),
    body("id_product").isInt({ min: 1 }).withMessage("Invalid product ID"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be positive"),
  ],
  ordercontroller.createOrder
);

// Endpoint untuk melihat daftar pesanan
router.get(
  "/",
  [
    query("user_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid user ID"),
  ],
  ordercontroller.getOrders
);

// Endpoint untuk mengubah status pesanan
router.put("/:id", ordercontroller.updateOrderStatus);

module.exports = router;
