const Product = require('../models/Product');
const Category = require('../models/Category');
const { assertOwnerOrAdmin } = require('../utils/accessControl');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const productPopulate = [
  { path: 'categoryId', select: 'name description isActive' },
  { path: 'createdBy', select: 'firstName lastName email role' },
];

async function createProduct(user, payload) {
  const category = await Category.findById(payload.categoryId);

  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  const product = await Product.create({
    sku: normalizeString(payload.sku),
    name: normalizeString(payload.name),
    description: normalizeString(payload.description) || '',
    categoryId: payload.categoryId,
    createdBy: user._id,
    basePrice: payload.basePrice,
    costPrice: payload.costPrice,
    isActive: payload.isActive ?? true,
  });

  return product.populate(productPopulate);
}

async function listProducts(user) {
  const filter = user.role === 'admin' ? {} : { createdBy: user._id };
  return Product.find(filter).sort({ createdAt: -1 }).populate(productPopulate);
}

async function getProductById(user, id) {
  const product = await Product.findById(id).populate(productPopulate);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

assertOwnerOrAdmin(user, product.createdBy._id, 'You can only access your own products');

  return product;
}

async function updateProduct(user, id, payload) {
  const product = await Product.findById(id);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  assertOwnerOrAdmin(user, product.createdBy, 'You can only update your own products');

  if (payload.categoryId) {
    const category = await Category.findById(payload.categoryId);
    if (!category) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
  }

  if (payload.sku !== undefined) product.sku = normalizeString(payload.sku);
  if (payload.name !== undefined) product.name = normalizeString(payload.name);
  if (payload.description !== undefined) product.description = normalizeString(payload.description);
  if (payload.categoryId !== undefined) product.categoryId = payload.categoryId;
  if (payload.basePrice !== undefined) product.basePrice = payload.basePrice;
  if (payload.costPrice !== undefined) product.costPrice = payload.costPrice;
  if (payload.isActive !== undefined) product.isActive = payload.isActive;

  await product.save();
  return product.populate(productPopulate);
}

async function deleteProduct(user, id) {
  const product = await Product.findById(id);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  assertOwnerOrAdmin(user, product.createdBy, 'You can only delete your own products');

  await product.deleteOne();
  return product.populate(productPopulate);
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
