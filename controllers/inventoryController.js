const inventoryService = require('../services/inventoryService');
const getHttpStatusCode = require('../utils/httpError');

async function createInventory(req, res) {
  try {
    const inventory = await inventoryService.createInventory(req.user, req.body);
    return res.status(201).json(inventory);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function listInventory(req, res) {
  try {
    const inventory = await inventoryService.listInventory(req.user);
    return res.status(200).json(inventory);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function getInventory(req, res) {
  try {
    const inventory = await inventoryService.getInventoryById(req.user, req.params.id);
    return res.status(200).json(inventory);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function updateInventory(req, res) {
  try {
    const inventory = await inventoryService.updateInventory(req.user, req.params.id, req.body);
    return res.status(200).json(inventory);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function deleteInventory(req, res) {
  try {
    const inventory = await inventoryService.deleteInventory(req.user, req.params.id);
    return res.status(200).json(inventory);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

module.exports = {
  createInventory,
  listInventory,
  getInventory,
  updateInventory,
  deleteInventory,
};