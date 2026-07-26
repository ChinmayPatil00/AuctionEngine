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
      imageUrl: imageUrl || 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=800',
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

    const liveAuctions = [
      {
        title: 'Vintage Rolex Daytona Paul Newman',
        description: 'Immaculate condition 1968 Rolex Daytona ref. 6239 "Paul Newman" dial. Box and papers included.',
        imageUrl: 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 150000,
        currentPrice: 185000,
        seller: user._id,
        startTime: new Date(Date.now() - 10 * 60000), // started 10 mins ago
        endTime: new Date(Date.now() + 60 * 60000), // ends in 1 hour
        status: 'active'
      },
      {
        title: 'Modern Abstract Masterpiece',
        description: 'Original contemporary canvas. Verified authenticity.',
        imageUrl: 'https://images.pexels.com/photos/164455/pexels-photo-164455.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 50000,
        currentPrice: 55000,
        seller: user._id,
        startTime: new Date(Date.now() - 5 * 60000), 
        endTime: new Date(Date.now() + 30 * 60000), 
        status: 'active'
      }
    ];

    const upcomingAuctions = [
      {
        title: '2024 Porsche 911 GT3 RS',
        description: 'Pristine condition, heavily optioned 911 GT3 RS in Shark Blue.',
        imageUrl: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 285000,
        currentPrice: 285000,
        seller: user._id,
        startTime: new Date(Date.now() + 2 * 60 * 60000), // starts in 2 hours
        endTime: new Date(Date.now() + 26 * 60 * 60000),
        status: 'active'
      },
      {
        title: 'Rare Diamond Necklace',
        description: 'Exquisite 10-carat diamond necklace with platinum setting.',
        imageUrl: 'https://images.pexels.com/photos/266566/pexels-photo-266566.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 120000,
        currentPrice: 120000,
        seller: user._id,
        startTime: new Date(Date.now() + 24 * 60 * 60000), // starts in 24 hours
        endTime: new Date(Date.now() + 48 * 60 * 60000),
        status: 'active'
      }
    ];

    const endedAuctions = [
      {
        title: 'Mid-Century Modern Villa',
        description: 'Architectural digest featured mid-century property.',
        imageUrl: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 3500000,
        currentPrice: 4800000,
        seller: user._id,
        highestBidder: user._id,
        startTime: new Date(Date.now() - 48 * 60 * 60000), 
        endTime: new Date(Date.now() - 24 * 60 * 60000), // ended 24 hours ago
        status: 'ended'
      },
      {
        title: 'Classic Vintage Camera Collection',
        description: 'Collection of 5 rare Leica cameras from the 1950s.',
        imageUrl: 'https://images.pexels.com/photos/1203803/pexels-photo-1203803.jpeg?auto=compress&cs=tinysrgb&w=800',
        startingPrice: 85000,
        currentPrice: 125000,
        seller: user._id,
        highestBidder: user._id,
        startTime: new Date(Date.now() - 72 * 60 * 60000), 
        endTime: new Date(Date.now() - 48 * 60 * 60000), // ended 48 hours ago
        status: 'ended'
      }
    ];

    await AuctionItem.insertMany([...liveAuctions, ...upcomingAuctions, ...endedAuctions]);
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
