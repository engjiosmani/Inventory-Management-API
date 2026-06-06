const {
  createOrder: createOrderService,
  listOrders,
  getOrderById,
  updateOrder: updateOrderService,
  deleteOrder: deleteOrderService,
} = require('../services/orderService');
const getHttpStatusCode = require('../utils/httpError');

async function create(req, res) {
  try {
    const order = await createOrderService(req.user, req.body);
    return res.status(201).json(order);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function getAll(req, res) {
  try {
    const orders = await listOrders(req.user);
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function getOne(req, res) {
  try {
    const order = await getOrderById(req.user, req.params.id);
    return res.status(200).json(order);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const order = await updateOrderService(req.user, req.params.id, req.body);
    return res.status(200).json(order);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const order = await deleteOrderService(req.user, req.params.id);
    return res.status(200).json(order);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};