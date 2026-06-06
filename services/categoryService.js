const Category = require('../models/Category');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

async function createCategory(payload) {
  const category = await Category.create({
    name: normalizeString(payload.name),
    description: normalizeString(payload.description) || '',
    isActive: payload.isActive ?? true,
  });

  return category;
}

async function listCategories() {
  return Category.find().sort({ createdAt: -1 });
}

async function getCategoryById(id) {
  const category = await Category.findById(id);

  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  return category;
}

async function updateCategory(id, payload) {
  const category = await Category.findByIdAndUpdate(
    id,
    {
      ...(payload.name !== undefined ? { name: normalizeString(payload.name) } : {}),
      ...(payload.description !== undefined ? { description: normalizeString(payload.description) } : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  return category;
}

async function deleteCategory(id) {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }

  return category;
}

module.exports = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};