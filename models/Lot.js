// models/Lot.js
import mongoose from 'mongoose';

// --- Sub-schema for bids ---
const bidSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Bid cannot be negative']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const LotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lot title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  abbi: {
    type: String,
    trim: true,
    maxlength: [50, 'ABBI cannot exceed 50 characters']
  },

  sire: {
    type: String,
    trim: true,
    maxlength: [100, 'Sire name cannot exceed 100 characters']
  },

  dam: {
    type: String,
    trim: true,
    maxlength: [100, 'Dam name cannot exceed 100 characters']
  },

  startingBid: {
    type: Number,
    min: [0, 'Starting bid cannot be negative'],
    default: 0
  },

  currentBid: {
    type: Number,
    min: [0, 'Current bid cannot be negative'],
    default: 0
  },

  // ✅ New: Bidding history
  bids: [bidSchema],

  photos: [{
    type: String,
    validate: {
      validator: function (url) {
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid photo URL'
    }
  }],

  videos: [{
    type: String,
    validate: {
      validator: function (url) {
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid video URL'
    }
  }],

  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: [true, 'Auction ID is required']
  },

  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  },

  status: {
    type: String,
    enum: ['active', 'sold', 'withdrawn', 'pending'],
    default: 'active'
  },

  // Winner information (when lot is sold)
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  winningBid: {
    type: Number,
    default: 0,
    min: [0, 'Winning bid cannot be negative']
  },

  soldAt: {
    type: Date,
    default: null
  },

  // Bidding information
  totalBids: {
    type: Number,
    default: 0,
    min: [0, 'Total bids cannot be negative']
  },

  // Additional metadata
  weight: { type: Number, min: [0, 'Weight cannot be negative'] },
  age: { type: String, trim: true },
  breed: { type: String, trim: true, maxlength: [50, 'Breed cannot exceed 50 characters'] },
  color: { type: String, trim: true, maxlength: [30, 'Color cannot exceed 30 characters'] },

  // Health and certification
  healthCertificates: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  vaccinations: [{
    name: String,
    date: Date,
    veterinarian: String
  }],

  // Location information
  location: {
    ranch: String,
    city: String,
    state: String,
    zipCode: String
  },

  // Consigner information
  consignerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  consignerName: { type: String, trim: true },

  // Auction settings
  reservePrice: { type: Number, min: [0, 'Reserve price cannot be negative'], default: 0 },
  hasReserve: { type: Boolean, default: false },

  // Timing
  biddingStartTime: { type: Date },
  biddingEndTime: { type: Date },

  // Notes and special instructions
  specialInstructions: { type: String, maxlength: [500, 'Special instructions cannot exceed 500 characters'] },
  internalNotes: { type: String, maxlength: [500, 'Internal notes cannot exceed 500 characters'] },

  // SEO and display
  slug: { type: String, trim: true, lowercase: true },
  featured: { type: Boolean, default: false },

  // Analytics
  views: { type: Number, default: 0, min: [0, 'Views cannot be negative'] },
  watchedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- Indexes ---
LotSchema.index({ auctionId: 1, order: 1 });
LotSchema.index({ status: 1 });
LotSchema.index({ auctionId: 1, status: 1 });
LotSchema.index({ slug: 1 });
LotSchema.index({ featured: 1 });
LotSchema.index({ createdAt: -1 });

// --- Virtuals ---
LotSchema.virtual('auction', {
  ref: 'Auction',
  localField: 'auctionId',
  foreignField: '_id',
  justOne: true
});

LotSchema.virtual('consigner', {
  ref: 'User',
  localField: 'consignerId',
  foreignField: '_id',
  justOne: true
});

LotSchema.virtual('winner', {
  ref: 'User',
  localField: 'winnerId',
  foreignField: '_id',
  justOne: true
});

// --- Pre-save slug ---
LotSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// --- Statics ---
LotSchema.statics.getByAuction = function (auctionId, includeInactive = false) {
  const query = { auctionId };
  if (!includeInactive) query.status = { $ne: 'withdrawn' };

  return this.find(query)
    .populate('auctionId', 'title name')
    .sort({ order: 1, createdAt: 1 });
};

// --- Instance Methods ---
LotSchema.methods.meetsReserve = function (bidAmount) {
  if (!this.hasReserve) return true;
  return bidAmount >= this.reservePrice;
};

LotSchema.methods.isBiddingActive = function () {
  if (this.status !== 'active') return false;

  const now = new Date();
  if (this.biddingStartTime && now < this.biddingStartTime) return false;
  if (this.biddingEndTime && now > this.biddingEndTime) return false;

  return true;
};

// --- Middleware: auto-update bid count ---
LotSchema.pre('save', function (next) {
  if (this.isModified('bids')) {
    this.totalBids = this.bids.length;
  }
  next();
});

const Lot = mongoose.models.Lot || mongoose.model('Lot', LotSchema);
export { Lot };
