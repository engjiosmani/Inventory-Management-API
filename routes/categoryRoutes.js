const express = require('express');
const categoryController = require('../controllers/categoryController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin'), categoryController.createCategory);
router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router;