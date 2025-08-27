import { connectToDB } from "@/lib/mongodb";
import { Lot } from "@/models/Lot";
import User from "@/models/User";

// GET a specific lot with populated bids (including biddingNumber)
export async function GET(req, { params }) {
  try {
    await connectToDB();
    const lot = await Lot.findById(params.lotId).populate(
      "bids.userId",
      "biddingNumber firstName lastName emailAddress"
    );

    if (!lot) {
      return new Response(JSON.stringify({ error: "Lot not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(lot), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// PATCH: Place a bid on this lot
export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { bid } = await req.json();
    const { lotId } = params;

    // 1. Validate user
    const user = await User.findById(bid.userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // 2. Validate lot
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return new Response(JSON.stringify({ error: "Lot not found" }), {
        status: 404,
      });
    }

    // 3. Append bid to lot.bids
    lot.bids.push({
      userId: user._id,
      amount: bid.amount,
      createdAt: new Date(),
    });

    // 4. Update summary fields
    lot.currentBid = bid.amount;
    lot.totalBids = lot.bids.length;
    lot.updatedAt = new Date();

    // 5. Save lot
    await lot.save();

    // 6. Repopulate bids with biddingNumber for frontend
    // PATCH response
    const populatedLot = await Lot.findById(lotId).populate(
      "bids.userId",
      "biddingNumber firstName lastName emailAddress"
    );

    const newBid = populatedLot.bids[populatedLot.bids.length - 1];

    return new Response(
      JSON.stringify({ success: true, bid: newBid, lot: populatedLot }),
      { status: 200 }
    );

    return new Response(JSON.stringify({ success: true, lot: populatedLot }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
