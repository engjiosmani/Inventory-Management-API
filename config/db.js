const mongoose = require('mongoose');

async function connectDB() {
  const url = process.env.MONGO_URL;
  console.log('Mongo URL:', url);
  if (!url) {
    console.error('Missing MONGO_URL in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(url);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongodb connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;