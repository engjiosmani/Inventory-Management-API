const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
};

module.exports = generateOrderNumber;