const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We will use a fallback local URI if the .env file isn't set up yet
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_engine');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
