const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bid', 'refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionItem',
    default: null,
  },
  description: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
