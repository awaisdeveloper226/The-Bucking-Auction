import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import { sendResetPasswordEmail } from "@/lib/mailer";
import { connectToDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email } = await req.json(); // frontend still sends `email`
    await connectToDB();

    // find user by emailAddress
    const user = await User.findOne({ emailAddress: email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 404 }
      );
    }

    // generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // send reset email
    await sendResetPasswordEmail(user.emailAddress, token);

    return NextResponse.json({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
