import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    console.log("🔍 Incoming ID:", id);

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Fetch user
    const user = await User.findById(id).select("-password").lean(); // ✅ exclude password directly
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert _id from ObjectId to string
    return NextResponse.json({
      ...user,
      _id: user._id.toString(),
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
