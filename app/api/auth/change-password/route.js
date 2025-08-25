import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectToDB();
    const { userId, oldPassword, newPassword } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Old password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("Change Password API Error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
