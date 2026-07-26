const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { setupBiddingSocket } = require('./socket/bidding');
const startAuctionResolver = require('./workers/auctionResolver');
const { startBotEngine } = require('./workers/botEngine');

// Connect to Databases
connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // We will restrict this in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auction Engine Backend Running' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));

// Socket.io Bidding Logic
setupBiddingSocket(io);

// Start Background Workers
startAuctionResolver(io);
startBotEngine(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
