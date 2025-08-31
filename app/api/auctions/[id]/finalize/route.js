// /api/auctions/[id]/finalize/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Auction } from "@/models/Auction";
import { Lot } from "@/models/Lot";

export async function POST(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    // Verify auction exists
    const auction = await Auction.findById(id);
    if (!auction) {
      return NextResponse.json(
        { success: false, message: "Auction not found" },
        { status: 404 }
      );
    }

    // Check if auction is already finalized
    if (auction.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Auction is already finalized" },
        { status: 400 }
      );
    }

    // Get all lots for this auction
    const lots = await Lot.find({ auctionId: id })
      .populate("bids.userId", "biddingNumber firstName lastName emailAddress")
      .sort({ order: 1 });

    const results = [];

    for (const lot of lots) {
      if (lot.status !== "active") {
        results.push({
          lotId: lot._id,
          title: lot.title,
          status: "skipped",
          reason: `Lot is already ${lot.status}`,
        });
        continue;
      }

      if (lot.bids.length === 0) {
        // No bids - mark as unsold
        await Lot.findByIdAndUpdate(lot._id, {
          status: "unsold",
          soldAt: new Date(),
        });
        results.push({
          lotId: lot._id,
          title: lot.title,
          status: "unsold",
          winningBid: 0,
        });
        continue;
      }

      // Find the highest bid
      const highestBid = lot.bids.reduce((max, bid) =>
        bid.amount > max.amount ? bid : max
      );

      // Check reserve price if applicable
      if (lot.hasReserve && highestBid.amount < lot.reservePrice) {
        // Reserve not met
        await Lot.findByIdAndUpdate(lot._id, {
          status: "reserve-not-met",
          soldAt: new Date(),
        });
        results.push({
          lotId: lot._id,
          title: lot.title,
          status: "reserve-not-met",
          highestBid: highestBid.amount,
          reservePrice: lot.reservePrice,
        });
        continue;
      }

      // Update lot with winner information
      await Lot.findByIdAndUpdate(
        lot._id,
        {
          winnerId: highestBid.userId._id,
          winningBid: highestBid.amount,
          soldAt: new Date(),
          status: "sold",
        },
        { new: true }
      );

      results.push({
        lotId: lot._id,
        title: lot.title,
        status: "sold",
        winnerId: highestBid.userId._id,
        winnerName: `${highestBid.userId.firstName} ${highestBid.userId.lastName}`,
        winningBid: highestBid.amount,
      });
    }

    // Mark auction as completed
    await Auction.findByIdAndUpdate(id, {
      status: "completed",
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Finalized ${lots.length} lots`,
      results,
    });
  } catch (error) {
    console.error("Error finalizing auction:", error);
    return NextResponse.json(
      { success: false, message: "Failed to finalize auction", error: error.message },
      { status: 500 }
    );
  }
}