const AuctionItem = require('../models/AuctionItem');
const User = require('../models/User');

const startAuctionResolver = (io) => {
  // Run this check every 10 seconds
  setInterval(async () => {
    try {
      // Find all auctions that have expired but are still marked as active
      const expiredAuctions = await AuctionItem.find({
        status: 'active',
        endTime: { $lte: new Date() }
      });

      for (let auction of expiredAuctions) {
        // Mark as ended
        auction.status = 'ended';
        
        // Transfer funds to the seller if there was a winner
        if (auction.highestBidder) {
          const seller = await User.findById(auction.seller);
          if (seller) {
            seller.walletBalance += auction.currentPrice;
            await seller.save();
          }
        }

        await auction.save();

        console.log(`Auction ${auction._id} resolved and closed.`);

        // Notify anyone currently in the room
        if (io) {
          io.to(auction._id.toString()).emit('auction_ended', {
            message: 'This auction has officially concluded.',
            winningBid: auction.currentPrice,
            winner: auction.highestBidder // Would populate this for a real app
          });
        }
      }
    } catch (error) {
      console.error('Error in Auction Resolver Worker:', error);
    }
  }, 10000); 
};

module.exports = startAuctionResolver;
