const AuctionItem = require('../models/AuctionItem');
const Bid = require('../models/Bid');

const createAuction = async (req, res) => {
  try {
    const { title, description, imageUrl, startingPrice, durationMinutes } = req.body;

    if (!title || !description || !startingPrice || !durationMinutes) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const endTime = new Date(Date.now() + durationMinutes * 60000);

    const auction = await AuctionItem.create({
      title,
      description,
      imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
      startingPrice,
      currentPrice: startingPrice,
      seller: req.user._id,
      endTime,
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ status: 'active', endTime: { $gt: new Date() } })
      .populate('seller', 'username')
      .populate('highestBidder', 'username')
      .sort({ endTime: 1 });
    
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

module.exports = {
  createAuction,
  getActiveAuctions,
  getAuctionById
};
