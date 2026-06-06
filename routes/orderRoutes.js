const express = require('express');
const orderController = require('../controllers/orderController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(protect);

router.post('/', orderController.create);
router.get('/', orderController.getAll);
router.get('/:id', orderController.getOne);
router.patch('/:id', authorize('admin'), orderController.update);
router.delete('/:id', authorize('admin'), orderController.remove);

module.exports = router;