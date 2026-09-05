const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS SRV resolution for mongodb+srv:// on all platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore if permissions or platform restricts setting DNS servers
}

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/AuctionEngine';

    // Ensure target database is AuctionEngine if not explicitly specified in URI path
    if (mongoUri.includes('mongodb.net/?') || mongoUri.endsWith('mongodb.net/')) {
      mongoUri = mongoUri.replace('mongodb.net/?', 'mongodb.net/AuctionEngine?').replace(/mongodb\.net\/$/, 'mongodb.net/AuctionEngine');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
