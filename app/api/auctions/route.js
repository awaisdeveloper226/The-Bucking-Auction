import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import {Auction} from "@/models/Auction";

// POST → Create auction
export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();

    const newAuction = new Auction(body);
    await newAuction.save();

    return NextResponse.json({ success: true, auction: newAuction });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error creating auction", error: error.message },
      { status: 500 }
    );
  }
}

// GET → Fetch all auctions
export async function GET() {
  try {
    await connectToDB();
    const auctions = await Auction.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, auctions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching auctions", error: error.message },
      { status: 500 }
    );
  }
}
