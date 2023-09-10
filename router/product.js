const express = require('express');
const router = express.Router();
const userAuthorizationMiddleware = require('../middleware/userAuthorizationMiddleware');
const productController = require('../controller/productController'); // Import your product controller

// Create a new product
router.post('/',userAuthorizationMiddleware, productController.createProduct);
router.get('/',productController.getAllProducts);
router.get('/:id',productController.getProductById);
router.put('/:id',productController.updateProductById);

router.delete('/:id',productController.deleteProductById);

router.delete('/:productId/images/:imageId',productController.deleteProductImageById);

// Add more routes for updating, deleting, and fetching products

module.exports = router;
