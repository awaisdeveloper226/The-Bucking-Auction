// models/Bid.js
import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  lot: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot', required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  ip: String // optional: store IP for anti-fraud
});

export default mongoose.models.Bid || mongoose.model('Bid', BidSchema);
