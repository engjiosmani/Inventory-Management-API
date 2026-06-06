const productService = require('../services/productService');
const getHttpStatusCode = require('../utils/httpError');

async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.user, req.body);
    return res.status(201).json(product);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function listProducts(req, res) {
  try {
    const products = await productService.listProducts(req.user);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const product = await productService.getProductById(req.user, req.params.id);
    return res.status(200).json(product);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productService.updateProduct(req.user, req.params.id, req.body);
    return res.status(200).json(product);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await productService.deleteProduct(req.user, req.params.id);
    return res.status(200).json(product);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};