const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', inventoryController.createInventory);
router.get('/', inventoryController.listInventory);
router.get('/:id', inventoryController.getInventory);
router.patch('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;