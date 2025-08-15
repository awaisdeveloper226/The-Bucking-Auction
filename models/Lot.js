// models/Lot.js
import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  alt: String
}, { _id: false });

const LotSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  media: [MediaSchema],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startPrice: { type: Number, default: 0 },
  reservePrice: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['draft','scheduled','live','closed','sold','cancelled'], default: 'draft' },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Lot || mongoose.model('Lot', LotSchema);
