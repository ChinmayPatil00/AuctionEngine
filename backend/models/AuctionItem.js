const mongoose = require('mongoose');

const auctionItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300?text=No+Image',
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active',
  }
}, { timestamps: true });

module.exports = mongoose.model('AuctionItem', auctionItemSchema);
