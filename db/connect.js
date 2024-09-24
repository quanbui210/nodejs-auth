const mongoose = require('mongoose');

const connectDB = async (url) => {
  console.log(`Connecting to MongoDB at ${url}`);
  try {
    await mongoose.connect(url);
    console.log('MongoDB connected successfully'); // Log on successful connection
  } catch (error) {
    console.error('MongoDB connection error:', error); // Log connection error
    throw error; // Rethrow the error for handling in the start function
  }
};

module.exports = connectDB;
