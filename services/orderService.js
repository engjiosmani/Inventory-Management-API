const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const generateOrderNumber = require('../utils/generateOrderNumber');
const { assertOwnerOrAdmin } = require('../utils/accessControl');

const orderPopulate = [
  { path: 'userId', select: 'firstName lastName email role' },
];

const orderItemPopulate = [
  { path: 'productId', populate: [{ path: 'categoryId', select: 'name' }] },
];

function normalizeItems(items) {
  const grouped = {};

  for (const item of items) {
    const key = item.productId.toString();
    const quantity = Number(item.quantity);

    if (grouped[key]) {
      grouped[key].quantity += quantity;
    } else {
      grouped[key] = {
        productId: item.productId,
        quantity,
        unitPrice: item.unitPrice,
      };
    }
  }

  return Object.values(grouped);
}

async function formatOrder(order) {
  const items = await OrderItem.find({ orderId: order._id }).populate(orderItemPopulate);
  return {
    ...order.toObject(),
    items,
  };
}

async function restoreInventoryFromOrder(orderId) {
  const orderItems = await OrderItem.find({ orderId });

  for (const item of orderItems) {
    const inventory = await Inventory.findOne({ productId: item.productId });

    if (inventory) {
      inventory.quantity += item.quantity;
      inventory.lastUpdated = new Date();
      await inventory.save();
    }
  }
}

async function createOrder(user, payload) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    const err = new Error('At least one order item is required');
    err.statusCode = 400;
    throw err;
  }

  const preparedItems = [];
  const inventorySnapshots = [];
  const normalizedItems = normalizeItems(payload.items);

  for (const item of normalizedItems) {
    const product = await Product.findById(item.productId);

    if (!product) {
      const err = new Error('One or more products were not found');
      err.statusCode = 404;
      throw err;
    }

    const inventory = await Inventory.findOne({ productId: item.productId });

    if (!inventory) {
      const err = new Error(`Inventory does not exist for product ${product.name}`);
      err.statusCode = 400;
      throw err;
    }

    const quantity = Number(item.quantity);
    const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : Number(product.basePrice);

    if (inventory.quantity < quantity) {
      const err = new Error(`Insufficient stock for product ${product.name}`);
      err.statusCode = 400;
      throw err;
    }

    preparedItems.push({
      product,
      inventory,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    });

    inventorySnapshots.push({
      inventoryId: inventory._id,
      quantity: inventory.quantity,
    });
  }

  const totalAmount = preparedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Number((totalAmount * 0.1).toFixed(2));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    userId: user._id,
    status: 'pending',
    totalAmount,
    tax,
    orderDate: new Date(),
  });

  const createdItems = [];

  try {
    for (const item of preparedItems) {
      const orderItem = await OrderItem.create({
        orderId: order._id,
        productId: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });

      createdItems.push(orderItem);

      item.inventory.quantity -= item.quantity;
      item.inventory.lastUpdated = new Date();
      await item.inventory.save();
    }
  } catch (error) {
    for (const snapshot of inventorySnapshots) {
      const inventory = await Inventory.findById(snapshot.inventoryId);
      if (inventory) {
        inventory.quantity = snapshot.quantity;
        inventory.lastUpdated = new Date();
        await inventory.save();
      }
    }

    await OrderItem.deleteMany({ orderId: order._id });
    await Order.findByIdAndDelete(order._id);
    throw error;
  }

  const fullOrder = await Order.findById(order._id).populate(orderPopulate);
  return formatOrder(fullOrder);
}

async function listOrders(user) {
  const filter = user.role === 'admin' ? {} : { userId: user._id };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate(orderPopulate);
  const result = [];

  for (const order of orders) {
    result.push(await formatOrder(order));
  }

  return result;
}

async function getOrderById(user, id) {
  const order = await Order.findById(id).populate(orderPopulate);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  assertOwnerOrAdmin(user, order.userId._id, 'You can only access your own orders');

  return formatOrder(order);
}

async function updateOrder(user, id, payload) {
  if (user.role !== 'admin') {
    const err = new Error('Only admin users can update orders');
    err.statusCode = 403;
    throw err;
  }

  const order = await Order.findById(id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const previousStatus = order.status;
  if (payload.status) {
    order.status = payload.status;
  }

  await order.save();

  if (previousStatus !== 'cancelled' && order.status === 'cancelled') {
    await restoreInventoryFromOrder(order._id);
  }

  const refreshedOrder = await Order.findById(order._id).populate(orderPopulate);
  return formatOrder(refreshedOrder);
}

async function deleteOrder(user, id) {
  if (user.role !== 'admin') {
    const err = new Error('Only admin users can delete orders');
    err.statusCode = 403;
    throw err;
  }

  const order = await Order.findById(id);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.status !== 'cancelled') {
    await restoreInventoryFromOrder(order._id);
  }

  await OrderItem.deleteMany({ orderId: order._id });
  await order.deleteOne();

  return order;
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
