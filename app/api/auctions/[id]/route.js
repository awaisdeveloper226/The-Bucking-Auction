import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Auction from "@/models/Auction";

// UPDATE → Edit auction
export async function PUT(req, { params }) {
  try {
    await connectToDB();
    const body = await req.json();
    const updatedAuction = await Auction.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!updatedAuction) {
      return NextResponse.json(
        { success: false, message: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, auction: updatedAuction });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating auction", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE → Remove auction
export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const deletedAuction = await Auction.findByIdAndDelete(params.id);

    if (!deletedAuction) {
      return NextResponse.json(
        { success: false, message: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Auction deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting auction", error: error.message },
      { status: 500 }
    );
  }
}
