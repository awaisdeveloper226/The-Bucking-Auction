import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Bidder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const { suspend, biddingNumber } = await req.json();

    const updateData = {};
    if (typeof suspend === "boolean") updateData.isSuspended = suspend;
    if (biddingNumber !== undefined) updateData.biddingNumber = biddingNumber;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: user.isSuspended ? "Suspended" : "Active",
        biddingNumber: user.biddingNumber,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Patch error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
