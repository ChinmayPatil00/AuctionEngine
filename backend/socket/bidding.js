const { redisClient } = require('../config/redis');
const AuctionItem = require('../models/AuctionItem');
const User = require('../models/User');
const Bid = require('../models/Bid');

const processBid = async (auctionId, userId, bidAmount, io) => {
  const lockKey = `lock:auction:${auctionId}`;

  try {
    const acquiredLock = await redisClient.set(lockKey, 'locked', {
      NX: true,
      PX: 5000 
    });

    if (!acquiredLock) {
      return { success: false, message: 'High traffic! Please try bidding again.' };
    }

    const auction = await AuctionItem.findById(auctionId);
    const user = await User.findById(userId);

    if (!auction || !user) {
      await redisClient.del(lockKey);
      return { success: false, message: 'Auction or User not found.' };
    }

    if (auction.seller.toString() === user._id.toString()) {
      await redisClient.del(lockKey);
      return { success: false, message: 'Sellers cannot bid on their own auctions.' };
    }

    if (auction.status !== 'active' || new Date(auction.endTime) < new Date()) {
      if (auction.status === 'active') {
        auction.status = 'ended';
        await auction.save();
      }
      await redisClient.del(lockKey);
      return { success: false, message: 'This auction has already ended.' };
    }

    if (bidAmount <= auction.currentPrice) {
      await redisClient.del(lockKey);
      return { success: false, message: `Bid must be higher than $${auction.currentPrice}` };
    }

    if (user.walletBalance < bidAmount) {
      await redisClient.del(lockKey);
      return { success: false, message: 'Insufficient funds in wallet!' };
    }

    // Refund previous bidder
    if (auction.highestBidder) {
      const previousBidder = await User.findById(auction.highestBidder);
      if (previousBidder) {
        previousBidder.walletBalance += auction.currentPrice;
        await previousBidder.save();
      }
    }

    // Deduct from new bidder
    user.walletBalance -= bidAmount;
    await user.save();

    // Anti-Sniper Logic
    const timeRemainingMs = new Date(auction.endTime).getTime() - Date.now();
    let extended = false;
    if (timeRemainingMs < 30000) {
      auction.endTime = new Date(Date.now() + 120000); 
      extended = true;
    }

    // Update Auction Item
    auction.currentPrice = bidAmount;
    auction.highestBidder = user._id;
    await auction.save();

    // Create Bid record
    const newBid = await Bid.create({
      auction: auctionId,
      user: user._id,
      amount: bidAmount
    });
    await newBid.populate('user', 'username');

    await redisClient.del(lockKey);

    const updatedAuction = await AuctionItem.findById(auctionId).populate('highestBidder', 'username');

    io.to(auctionId).emit('bid_update', {
      currentPrice: updatedAuction.currentPrice,
      highestBidder: updatedAuction.highestBidder.username,
      message: extended ? `Anti-Sniper Activated! Auction extended by 2 mins!` : `New bid of $${bidAmount} by ${updatedAuction.highestBidder.username}!`,
      newEndTime: extended ? updatedAuction.endTime : null,
      newBidRecord: {
        id: newBid._id,
        username: newBid.user.username,
        amount: newBid.amount,
        createdAt: newBid.createdAt
      }
    });

    return { success: true, newBalance: user.walletBalance };

  } catch (error) {
    console.error('Process Bid Error:', error);
    await redisClient.del(lockKey);
    return { success: false, message: 'An error occurred processing your bid.' };
  }
};

const setupBiddingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // Join an auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined auction room: ${auctionId}`);
    });

    // Handle incoming bids
    socket.on('place_bid', async (data) => {
      const { auctionId, userId, bidAmount } = data;
      try {
        const result = await processBid(auctionId, userId, bidAmount, io);
        if (!result.success) {
          return socket.emit('bid_error', { message: result.message });
        }
        socket.emit('wallet_update', { newBalance: result.newBalance });
      } catch (error) {
        console.error('Socket Bidding Error:', error);
        socket.emit('bid_error', { message: 'An error occurred processing your bid.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupBiddingSocket, processBid };
