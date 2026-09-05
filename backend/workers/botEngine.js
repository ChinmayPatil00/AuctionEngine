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
  
  const isReplicaSet = ['ReplicaSetWithPrimary', 'ReplicaSetNoPrimary', 'Sharded'].includes(
    mongoose.connection.client?.topology?.description?.type
  );

  let pollingStarted = false;
  const startPolling = () => {
    if (pollingStarted) return;
    pollingStarted = true;
    console.warn('[BotEngine] ⚠️ Change Streams not supported (no replica set). Falling back to Polling Mode.');
    setInterval(async () => {
      try {
        const activeAuctions = await AuctionItem.find({ status: 'active', endTime: { $gt: new Date() } });
        for (const auction of activeAuctions) {
          await simulateBotBids(auction, io);
        }
      } catch (error) {
        console.error('[BotEngine] Polling Error:', error);
      }
    }, 8000);
  };

  if (!isReplicaSet) {
    startPolling();
    return;
  }

  try {
    // Event-Driven architecture with MongoDB Change Streams (on Atlas / Replica Set)
    const changeStream = AuctionItem.watch([
      { $match: { 'operationType': { $in: ['insert', 'update'] } } }
    ]);

    changeStream.on('error', (err) => {
      console.warn('[BotEngine] ChangeStream error encountered:', err.message);
      try { changeStream.close(); } catch (_) {}
      startPolling();
    });
    
    console.log('[BotEngine] ✅ Change Streams activated! Engine is now purely event-driven (0% Idle CPU).');
    
    changeStream.on('change', async (change) => {
      try {
        const activeAuctions = await AuctionItem.find({ status: 'active' });
        for (const auction of activeAuctions) {
          if (new Date(auction.endTime) > new Date()) {
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
    startPolling();
  }
};

module.exports = { startBotEngine };
