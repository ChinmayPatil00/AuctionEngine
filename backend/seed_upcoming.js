const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AuctionItem = require('./models/AuctionItem');
const User = require('./models/User');

dotenv.config();

const seedUpcoming = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_engine';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    const user = await User.findOne(); // get any user to be the seller
    if (!user) {
      console.log('No users found. Please register a user first.');
      process.exit(1);
    }

    const upcomingAuctions = [
      {
        title: '2024 Porsche 911 GT3 RS',
        description: 'Pristine condition, heavily optioned 911 GT3 RS in Shark Blue.',
        imageUrl: 'https://images.unsplash.com/photo-1503376712351-1c4360cb6e22?q=80&w=800&auto=format&fit=crop',
        startingPrice: 285000,
        currentPrice: 285000,
        seller: user._id,
        startTime: new Date(Date.now() + 2 * 60 * 60000), // starts in 2 hours
        endTime: new Date(Date.now() + 26 * 60 * 60000),
      },
      {
        title: 'Rare 1st Edition Charizard PSA 10',
        description: 'Gem Mint PSA 10 First Edition Base Set Charizard.',
        imageUrl: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=800&auto=format&fit=crop',
        startingPrice: 150000,
        currentPrice: 150000,
        seller: user._id,
        startTime: new Date(Date.now() + 24 * 60 * 60000), // starts in 24 hours
        endTime: new Date(Date.now() + 48 * 60 * 60000),
      }
    ];

    await AuctionItem.insertMany(upcomingAuctions);
    console.log('Successfully seeded upcoming auctions!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUpcoming();
