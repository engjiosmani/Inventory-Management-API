const isAdmin = (user) => Boolean(user && user.role === 'admin');

const assertOwnerOrAdmin = (user, ownerId, message = 'Forbidden') => {
  if (isAdmin(user)) {
    return;
  }

  if (!user || !ownerId || ownerId.toString() !== user._id.toString()) {
    const err = new Error(message);
    err.statusCode = 403;
    throw err;
  }
};

module.exports = {
  isAdmin,
  assertOwnerOrAdmin,
};