import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import { sendResetPasswordEmail } from "@/lib/mailer";
import { connectToDB } from "@/lib/mongodb";
export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectToDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "Email not found" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(email, token);

    return NextResponse.json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
