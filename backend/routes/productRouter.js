/**
 * Product routes module.
 * @module routes/productRoutes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const upload = require('../middlewares/upload');
const productController = require('../controllers/productController');

/**
 * Express router instance.
 * @type {Express.Router}
 */
const router = express.Router();

/**
 * Validates product data.
 * @type {import('express-validator').ValidationChain[]}
 */
const validateProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('stock').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
];

/**
 * Creates a new product.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next function.
 */
router.post(
  '/',
  upload.single('image'),
  validateProduct,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'Image is required' }] });
    }
    next();
  },
  productController.createProduct
);

/**
 * Retrieves a list of all products.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
router.get('/', productController.getProducts);

/**
 * Retrieves a product by its ID.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
router.get('/:id', productController.getProductById);

/**
 * Updates a product by its ID.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 * @param {import('express').NextFunction} next - The next function.
 */
router.put(
  '/:id',
  upload.single('image'),
  validateProduct,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: 'Image is required' }] });
    }
    next();
  },
  productController.updateProduct
);

/**
 * Deletes a product by its ID.
 * @param {import('express').Request} req - The request object.
 * @param {import('express').Response} res - The response object.
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;

