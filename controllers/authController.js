const authService = require('../services/authService');
const getHttpStatusCode = require('../utils/httpError');

async function register(req, res) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function login(req, res) {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

async function me(req, res) {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(getHttpStatusCode(err)).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  me,
};