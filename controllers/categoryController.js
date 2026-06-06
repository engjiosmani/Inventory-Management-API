const categoryService = require('../services/categoryService');
const getHttpStatusCode = require('../utils/httpError');

async function createCategory(req, res) {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function listCategories(req, res) {
  try {
    const categories = await categoryService.listCategories();
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function getCategory(req, res) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return res.status(200).json(category);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function updateCategory(req, res) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json(category);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function deleteCategory(req, res) {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    return res.status(200).json(category);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

module.exports = {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};