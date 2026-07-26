const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AuctionItem = require('./models/AuctionItem');
const User = require('./models/User');

dotenv.config();

const seedEnded = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_engine';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    const user = await User.findOne(); // get any user to be the seller
    if (!user) {
      console.log('No users found. Please register a user first.');
      process.exit(1);
    }

    const endedAuctions = [
      {
        title: 'Original Apple-1 Computer',
        description: 'Fully functional, authenticated Apple-1 motherboard from 1976.',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abf0ceb6?q=80&w=800&auto=format&fit=crop',
        startingPrice: 350000,
        currentPrice: 480000,
        seller: user._id,
        highestBidder: user._id,
        startTime: new Date(Date.now() - 48 * 60 * 60000), 
        endTime: new Date(Date.now() - 24 * 60 * 60000), // ended 24 hours ago
        status: 'ended'
      },
      {
        title: 'Banksy "Girl with Balloon" Authentic Print',
        description: 'Signed artist proof, mint condition.',
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
        startingPrice: 85000,
        currentPrice: 125000,
        seller: user._id,
        highestBidder: user._id,
        startTime: new Date(Date.now() - 72 * 60 * 60000), 
        endTime: new Date(Date.now() - 48 * 60 * 60000), // ended 48 hours ago
        status: 'ended'
      }
    ];

    await AuctionItem.insertMany(endedAuctions);
    console.log('Successfully seeded ended auctions!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedEnded();
