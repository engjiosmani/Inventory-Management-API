const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const { assertOwnerOrAdmin } = require('../utils/accessControl');

const inventoryPopulate = [
  {
    path: 'productId',
    populate: [
      { path: 'categoryId', select: 'name description' },
      { path: 'createdBy', select: 'firstName lastName email role' },
    ],
  },
];

async function ensureProductAccess(user, productId, message) {
  const product = await Product.findById(productId);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  assertOwnerOrAdmin(user, product.createdBy, message);
  return product;
}

async function createInventory(user, payload) {
  await ensureProductAccess(user, payload.productId, 'You can only manage inventory for your own products');

  const exists = await Inventory.findOne({ productId: payload.productId });
  if (exists) {
    const err = new Error('Inventory already exists for this product');
    err.statusCode = 400;
    throw err;
  }

  const inventory = await Inventory.create({
    productId: payload.productId,
    quantity: payload.quantity ?? 0,
    lastUpdated: new Date(),
  });

  return inventory.populate(inventoryPopulate);
}

async function listInventory(user) {
  if (user.role === 'admin') {
    return Inventory.find().sort({ createdAt: -1 }).populate(inventoryPopulate);
  }

  const products = await Product.find({ createdBy: user._id }).select('_id');
  const productIds = [];
  for (let i = 0; i < products.length; i += 1) {
    productIds.push(products[i]._id);
  }
  return Inventory.find({ productId: { $in: productIds } }).sort({ createdAt: -1 }).populate(inventoryPopulate);
}

async function getInventoryById(user, id) {
  const inventory = await Inventory.findById(id).populate(inventoryPopulate);

  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role !== 'admin') {
    assertOwnerOrAdmin(user, inventory.productId.createdBy._id, 'You can only access your own inventory');
  }

  return inventory;
}

async function updateInventory(user, id, payload) {
  const inventory = await Inventory.findById(id);

  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  const product = await Product.findById(inventory.productId);
  assertOwnerOrAdmin(user, product.createdBy, 'You can only update your own inventory');

  if (payload.quantity !== undefined) {
    inventory.quantity = payload.quantity;
  }

  inventory.lastUpdated = new Date();
  await inventory.save();
  return inventory.populate(inventoryPopulate);
}

async function deleteInventory(user, id) {
  const inventory = await Inventory.findById(id);

  if (!inventory) {
    const err = new Error('Inventory not found');
    err.statusCode = 404;
    throw err;
  }

  const product = await Product.findById(inventory.productId);
  assertOwnerOrAdmin(user, product.createdBy, 'You can only delete your own inventory');

  await inventory.deleteOne();
  return inventory.populate(inventoryPopulate);
}

module.exports = {
  createInventory,
  listInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
};