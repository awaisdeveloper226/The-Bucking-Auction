import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mailer";

/** Generate a human-readable unique bidding number for buyers */
async function generateUniqueBiddingNumber() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const base = `BN-${y}${m}`;

  while (true) {
    const suffix = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const candidate = `${base}-${suffix}`;
    const exists = await User.findOne({ biddingNumber: candidate }).lean();
    if (!exists) return candidate;
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { name, email, password, role } = body || {};

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (!["buyer", "seller"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role." },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already in use." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const doc = {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      isVerified: false,
      verificationToken,
    };

    // Assign bidding number if buyer
    if (role === "buyer") {
      doc.biddingNumber = await generateUniqueBiddingNumber();
    }

    const user = await User.create(doc);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please check your email to verify your account before logging in.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          biddingNumber: user.biddingNumber || null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
