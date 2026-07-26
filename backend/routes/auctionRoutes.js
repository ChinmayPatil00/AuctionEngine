const express = require('express');
const router = express.Router();
const { createAuction, getActiveAuctions, getAuctionById } = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createAuction); // Must be logged in to create
router.get('/active', getActiveAuctions); // Anyone can view active auctions
router.get('/:id', getAuctionById); // View a single auction room

module.exports = router;
