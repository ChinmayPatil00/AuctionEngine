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

const simulateBotBids = async (auction, io) => {
  if (botUsers.length === 0) return;
  try {
    const randomBot = botUsers[Math.floor(Math.random() * botUsers.length)];

    const isBotWinning = botUsers.some(b => b._id.toString() === auction.highestBidder?.toString());
    if (isBotWinning && Math.random() > 0.30) return;

    const incrementPercent = 0.01 + (Math.random() * 0.04);
    let bidAmount = Math.floor(auction.currentPrice * (1 + incrementPercent));
    
    if (bidAmount <= auction.currentPrice) {
      bidAmount = auction.currentPrice + 10;
    }

    console.log(`[BotEngine] 🤖 ${randomBot.username} is attempting to bid $${bidAmount} on ${auction.title}...`);
    
    const result = await processBid(auction._id.toString(), randomBot._id.toString(), bidAmount, io);
    if (result.success) {
      console.log(`[BotEngine] ✅ ${randomBot.username} successfully outbid the room!`);
    } else {
      console.log(`[BotEngine] ❌ ${randomBot.username} bid failed: ${result.message}`);
    }
  } catch (error) {
    console.error('[BotEngine] Cycle error:', error);
  }
};

const startBotEngine = async (io) => {
  console.log('[BotEngine] Initializing Autonomous Bidding Engine...');
  await seedBots();
  
  try {
    // Attempt to use MongoDB Change Streams for Event-Driven architecture (requires Replica Set)
    const changeStream = AuctionItem.watch([
      { $match: { 'operationType': { $in: ['insert', 'update'] } } }
    ]);
    
    console.log('[BotEngine] ✅ Change Streams activated! Engine is now purely event-driven (0% Idle CPU).');
    
    changeStream.on('change', async (change) => {
      // If a new auction is created or an existing auction receives a bid, wake up the bots
      try {
        const activeAuctions = await AuctionItem.find({ status: 'active' });
        for (const auction of activeAuctions) {
          if (new Date(auction.endTime) > new Date()) {
            // Random delay to make it feel human (1 to 4 seconds)
            setTimeout(() => {
              simulateBotBids(auction, io);
            }, Math.floor(Math.random() * 3000) + 1000);
          }
        }
      } catch (err) {
        console.error('[BotEngine] Error handling change stream event:', err);
      }
    });
    
  } catch (err) {
    // Fallback to polling if local MongoDB doesn't support Change Streams
    console.warn('[BotEngine] ⚠️ Change Streams not supported (no replica set). Falling back to Polling Mode (Not recommended for high scale).');
    setInterval(async () => {
      try {
        const activeAuctions = await AuctionItem.find({ status: 'active', endTime: { $gt: new Date() } });
        for (const auction of activeAuctions) {
          await simulateBotBids(auction, io);
        }
      } catch (error) {
        console.error('[BotEngine] Polling Error:', error);
      }
    }, 5000);
  }
};

module.exports = { startBotEngine };
