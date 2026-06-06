const jwt = require('jsonwebtoken');

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not set');
  }

  if (!userId) {
    throw new Error('userId is required to generate token');
  }

  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ sub: userId }, secret, { expiresIn });
}

module.exports = signToken;