const express = require('express');
const productController = require('../controllers/productController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', productController.createProduct);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;