// models/Auction.js
import mongoose from 'mongoose';

const AuctionSchema = new mongoose.Schema({
  name: String,
  venue: String,
  startsAt: Date,
  endsAt: Date,
  lots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lot' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Auction || mongoose.model('Auction', AuctionSchema);
