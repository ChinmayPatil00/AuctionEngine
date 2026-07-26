const AuctionItem = require('../models/AuctionItem');
const Bid = require('../models/Bid');

const createAuction = async (req, res) => {
  try {
    const { title, description, imageUrl, startingPrice, durationMinutes, delayMinutes } = req.body;

    if (!title || !description || !startingPrice || !durationMinutes) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const delay = delayMinutes ? parseInt(delayMinutes) : 0;
    const startTime = new Date(Date.now() + delay * 60000);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const auction = await AuctionItem.create({
      title,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      startingPrice,
      currentPrice: startingPrice,
      seller: req.user._id,
      startTime,
      endTime,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ 
      status: 'active', 
      startTime: { $lte: new Date() },
      endTime: { $gt: new Date() } 
    })
      .populate('seller', 'username')
      .populate('highestBidder', 'username')
      .sort({ endTime: 1 });
    
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ 
      status: 'active', 
      startTime: { $gt: new Date() } 
    })
      .populate('seller', 'username')
      .sort({ startTime: 1 });
    
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEndedAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ 
      $or: [
        { status: 'ended' },
        { endTime: { $lte: new Date() } }
      ]
    })
      .populate('seller', 'username')
      .populate('highestBidder', 'username')
      .sort({ endTime: -1 });
    
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuctionById = async (req, res) => {
  try {
    const auction = await AuctionItem.findById(req.params.id)
      .populate('seller', 'username')
      .populate('highestBidder', 'username');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Fetch Bid history, most recent first
    const bids = await Bid.find({ auction: auction._id })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ ...auction.toObject(), bidHistory: bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedAuctions = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne();
    if (!user) return res.status(400).json({ message: 'Register a user first' });

    // Wipe existing test data to prevent duplicates when clicking seed multiple times
    await AuctionItem.deleteMany({});
    await Bid.deleteMany({});

    const upcomingAuctions = [
      {
        title: '2024 Porsche 911 GT3 RS',
        description: 'Pristine condition, heavily optioned 911 GT3 RS in Shark Blue.',
        imageUrl: 'https://images.unsplash.com/photo-1503376712351-1c4360cb6e22?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        startingPrice: 285000,
        currentPrice: 285000,
        seller: user._id,
        startTime: new Date(Date.now() + 2 * 60 * 60000), // starts in 2 hours
        endTime: new Date(Date.now() + 26 * 60 * 60000),
      },
      {
        title: 'Rare 1st Edition Charizard PSA 10',
        description: 'Gem Mint PSA 10 First Edition Base Set Charizard.',
        imageUrl: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        startingPrice: 150000,
        currentPrice: 150000,
        seller: user._id,
        startTime: new Date(Date.now() + 24 * 60 * 60000), // starts in 24 hours
        endTime: new Date(Date.now() + 48 * 60 * 60000),
      }
    ];

    const endedAuctions = [
      {
        title: 'Original Apple-1 Computer',
        description: 'Fully functional, authenticated Apple-1 motherboard from 1976.',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abf0ceb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
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
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        startingPrice: 85000,
        currentPrice: 125000,
        seller: user._id,
        highestBidder: user._id,
        startTime: new Date(Date.now() - 72 * 60 * 60000), 
        endTime: new Date(Date.now() - 48 * 60 * 60000), // ended 48 hours ago
        status: 'ended'
      }
    ];

    await AuctionItem.insertMany([...upcomingAuctions, ...endedAuctions]);
    res.status(200).json({ message: 'Successfully seeded Upcoming and Ended auctions to your database!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAuction,
  getActiveAuctions,
  getUpcomingAuctions,
  getEndedAuctions,
  getAuctionById,
  seedAuctions
};
