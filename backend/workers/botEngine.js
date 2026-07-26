const mongoose = require('mongoose');
const User = require('../models/User');
const AuctionItem = require('../models/AuctionItem');
const { processBid } = require('../socket/bidding');
const bcrypt = require('bcryptjs');

const BOT_NAMES = ['CryptoWhale', 'DubaiPrince', 'ArtCollector_99', 'SniperBot', 'Anonymous'];
let botUsers = [];

const seedBots = async () => {
  try {
    for (const name of BOT_NAMES) {
      let bot = await User.findOne({ email: `${name.toLowerCase()}@bot.com` });
      if (!bot) {
        // Create bot with $100M wallet
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('botpassword123', salt);
        bot = await User.create({
          username: name,
          email: `${name.toLowerCase()}@bot.com`,
          password: hashedPassword,
          walletBalance: 100000000,
        });
        console.log(`[BotEngine] Spawned AI Bot: ${name}`);
      } else {
        // Replenish bot wallet if low
        if (bot.walletBalance < 10000000) {
          bot.walletBalance = 100000000;
          await bot.save();
        }
      }
      botUsers.push(bot);
    }
    console.log(`[BotEngine] Successfully loaded ${botUsers.length} AI Bots into memory.`);
  } catch (error) {
    console.error('[BotEngine] Failed to seed bots:', error);
  }
};

const runBiddingCycle = async (io) => {
  if (botUsers.length === 0) return;

  try {
    // Find all active auctions
    const activeAuctions = await AuctionItem.find({ 
      status: 'active',
      endTime: { $gt: new Date() }
    });

    for (const auction of activeAuctions) {
      // 100% chance a bot bids on this cycle for testing (Removed the 25% skip)
      // Pick a random bot
      const randomBot = botUsers[Math.floor(Math.random() * botUsers.length)];

      // Don't bid against ourselves unless there's a 30% chance
      const isBotWinning = botUsers.some(b => b._id.toString() === auction.highestBidder?.toString());
      if (isBotWinning && Math.random() > 0.30) continue;

      // Calculate a realistic bid increment (1% to 5% higher)
      const incrementPercent = 0.01 + (Math.random() * 0.04);
      let bidAmount = Math.floor(auction.currentPrice * (1 + incrementPercent));
      
      // If current price is low, min increment might be 0, so ensure at least $10
      if (bidAmount <= auction.currentPrice) {
        bidAmount = auction.currentPrice + 10;
      }

      console.log(`[BotEngine] 🤖 ${randomBot.username} is attempting to bid $${bidAmount} on ${auction.title}...`);
      
      // Execute bid through exact same locking logic as human users
      // FORCE STRING CONVERSION FOR SOCKET.IO ROOM COMPATIBILITY
      const result = await processBid(auction._id.toString(), randomBot._id.toString(), bidAmount, io);
      if (result.success) {
        console.log(`[BotEngine] ✅ ${randomBot.username} successfully outbid the room!`);
      } else {
        console.log(`[BotEngine] ❌ ${randomBot.username} bid failed: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('[BotEngine] Cycle error:', error);
  }
};

const startBotEngine = async (io) => {
  console.log('[BotEngine] Initializing Autonomous Bidding Engine...');
  await seedBots();
  
  // Run cycle every 5 seconds
  setInterval(() => runBiddingCycle(io), 5000);
  console.log('[BotEngine] Bidding Engine is now online and monitoring active auctions.');
};

module.exports = { startBotEngine };
