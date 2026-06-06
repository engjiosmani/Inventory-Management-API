const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/signToken');

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const buildUserPayload = (user) => ({
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

async function registerUser(payload) {
  const email = normalizeString(payload.email)?.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const err = new Error('Email already exists');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create({
    email,
    firstName: normalizeString(payload.firstName),
    lastName: normalizeString(payload.lastName),
    password: payload.password,
    role: payload.role || 'employee',
  });

  const token = generateToken(user._id.toString());

  return {
    token,
    user: buildUserPayload(user),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeString(email)?.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id.toString());

  return {
    token,
    user: buildUserPayload(user),
  };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId).select('-password');

  if (!user || !user.isActive) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return buildUserPayload(user);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};