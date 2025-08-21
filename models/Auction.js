import mongoose from "mongoose";

const AuctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    flyer: { type: String }, // flyer image url

    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    

    // Status: draft / published / archived
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Auction ||
  mongoose.model("Auction", AuctionSchema);
