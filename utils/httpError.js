const getHttpStatusCode = (err) => {
  if (err && err.statusCode) {
    return err.statusCode;
  }

  if (!err) {
    return 500;
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return 400;
  }

  if (err.code === 11000) {
    return 409;
  }

  return 500;
};

module.exports = getHttpStatusCode;