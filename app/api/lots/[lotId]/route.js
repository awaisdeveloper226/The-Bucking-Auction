import { connectToDB } from "@/lib/mongodb";
import { Lot } from "@/models/Lot";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const lot = await Lot.findById(params.lotId).populate("bids.userId", "firstName lastName emailAddress");
    if (!lot) return new Response(JSON.stringify({ error: "Lot not found" }), { status: 404 });
    return new Response(JSON.stringify(lot), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { bid } = await req.json();
    const { lotId } = params;

    const user = await User.findById(bid.userId);
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    const lot = await Lot.findById(lotId);
    if (!lot) return new Response(JSON.stringify({ error: "Lot not found" }), { status: 404 });

    lot.bids.push({ userId: user._id, amount: bid.amount });
    lot.currentBid = bid.amount;
    lot.totalBids = lot.bids.length;

    await lot.save();

    return new Response(JSON.stringify({ success: true, lot }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
