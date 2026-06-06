const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      const err = new Error('Not authorized, token missing');
      err.statusCode = 401;
      throw err;
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('User account is inactive');
      err.statusCode = 403;
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(err.statusCode || 401).json({ message: err.message });
  }
};

module.exports = protect;