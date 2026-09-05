const mongoose = require('mongoose');
const { redisClient } = require('../config/redis');
const AuctionItem = require('../models/AuctionItem');
const User = require('../models/User');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

const processBid = async (auctionId, userId, bidAmount, io) => {
  const lockKey = `lock:auction:${auctionId}`;
  const lockValue = Math.random().toString(36).substring(2) + Date.now().toString(36);

  try {
    const acquiredLock = await redisClient.set(lockKey, lockValue, {
      NX: true,
      PX: 5000 
    });

    if (!acquiredLock) {
      return { success: false, message: 'High traffic! Please try bidding again.' };
    }

    const isReplicaSet = ['ReplicaSetWithPrimary', 'ReplicaSetNoPrimary', 'Sharded'].includes(
      mongoose.connection.client?.topology?.description?.type
    );
    const session = isReplicaSet ? await mongoose.startSession() : null;
    if (session) {
      session.startTransaction();
    }

    const abortAndEndSession = async () => {
      if (session) {
        try { await session.abortTransaction(); } catch (_) {}
        try { session.endSession(); } catch (_) {}
      }
    };

    let newBalance, extended = false, newBidId, newBidUsername, newBidCreatedAt;

    try {
      const auctionQuery = AuctionItem.findById(auctionId);
      const userQuery = User.findById(userId);
      if (session) {
        auctionQuery.session(session);
        userQuery.session(session);
      }
      const auction = await auctionQuery;
      const user = await userQuery;

      if (!auction || !user) {
        await abortAndEndSession();
        return { success: false, message: 'Auction or User not found.' };
      }

      if (auction.status !== 'active' || new Date(auction.endTime) < new Date()) {
        if (auction.status === 'active') {
          auction.status = 'ended';
          await auction.save(session ? { session } : undefined);
        }
        await abortAndEndSession();
        return { success: false, message: 'This auction has already ended.' };
      }

      if (bidAmount <= auction.currentPrice) {
        await abortAndEndSession();
        return { success: false, message: `Bid must be higher than $${auction.currentPrice}` };
      }

      if (user.walletBalance < bidAmount) {
        await abortAndEndSession();
        return { success: false, message: 'Insufficient funds in wallet!' };
      }

      // Refund previous bidder
      if (auction.highestBidder) {
        const prevBidderQuery = User.findById(auction.highestBidder);
        if (session) prevBidderQuery.session(session);
        const previousBidder = await prevBidderQuery;
        if (previousBidder) {
          previousBidder.walletBalance += auction.currentPrice;
          await previousBidder.save(session ? { session } : undefined);
          await Transaction.create([{
            user: previousBidder._id,
            type: 'refund',
            amount: auction.currentPrice,
            auction: auctionId,
            description: `Outbid refund for ${auction.title}`
          }], session ? { session } : {});
        }
      }

      // Deduct from new bidder
      user.walletBalance -= bidAmount;
      await user.save(session ? { session } : undefined);
      await Transaction.create([{
        user: user._id,
        type: 'bid',
        amount: bidAmount,
        auction: auctionId,
        description: `Bid placed on ${auction.title}`
      }], session ? { session } : {});

      newBalance = user.walletBalance;

      // Anti-Sniper Logic
      const timeRemainingMs = new Date(auction.endTime).getTime() - Date.now();
      if (timeRemainingMs < 30000) {
        auction.endTime = new Date(Date.now() + 120000); 
        extended = true;
      }

      // Update Auction Item
      auction.currentPrice = bidAmount;
      auction.highestBidder = user._id;
      await auction.save(session ? { session } : undefined);

      // Create Bid record
      const [newBid] = await Bid.create([{
        auction: auctionId,
        user: user._id,
        amount: bidAmount
      }], session ? { session } : {});

      newBidId = newBid._id;
      newBidUsername = user.username;
      newBidCreatedAt = newBid.createdAt;

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

    } catch (error) {
      await abortAndEndSession();
      throw error;
    }

    // Safely emit socket events using committed data
    const updatedAuction = await AuctionItem.findById(auctionId).populate('highestBidder', 'username');
    const highestBidderUsername = updatedAuction.highestBidder?.username || newBidUsername || 'Anonymous';

    io.to(auctionId).emit('bid_update', {
      currentPrice: updatedAuction.currentPrice,
      highestBidder: highestBidderUsername,
      message: extended ? `Anti-Sniper Activated! Auction extended by 2 mins!` : `New bid of $${bidAmount} by ${highestBidderUsername}!`,
      newEndTime: extended ? updatedAuction.endTime : null,
      newBidRecord: {
        id: newBidId,
        _id: newBidId,
        username: highestBidderUsername,
        amount: bidAmount,
        createdAt: newBidCreatedAt
      }
    });

    return { success: true, newBalance };

  } catch (error) {
    console.error('Process Bid Error:', error);
    return { success: false, message: 'An error occurred processing your bid.' };
  } finally {
    const currentValue = await redisClient.get(lockKey);
    if (currentValue === lockValue) {
      await redisClient.del(lockKey);
    }
  }
};

const setupBiddingSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback');
      socket.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      console.warn('Socket Auth Error:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id} (Auth: ${socket.user ? socket.user.username : 'Anonymous'})`);

    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined auction room: ${auctionId}`);
    });

    socket.on('place_bid', async (data) => {
      const { auctionId, bidAmount } = data;
      
      let realUserId;
      if (data.isBot && data.botSecret === 'INTERNAL_BOT_SECRET') {
        realUserId = data.userId;
      } else if (socket.user) {
        realUserId = socket.user._id;
      } else {
        return socket.emit('bid_error', { message: 'Unauthorized. Please log in.' });
      }

      try {
        const result = await processBid(auctionId, realUserId, bidAmount, io);
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
