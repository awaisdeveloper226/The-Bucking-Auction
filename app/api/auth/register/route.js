import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mailer";

async function generateUniqueBiddingNumber() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const base = `BN-${y}${m}`;
  while (true) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}-${suffix}`;
    const exists = await User.findOne({ biddingNumber: candidate }).lean();
    if (!exists) return candidate;
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const { firstName, lastName, cellPhone, emailAddress, password, physicalAddress } = await req.json();

    if (!firstName || !lastName || !cellPhone || !emailAddress || !password || !physicalAddress) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    const existing = await User.findOne({ emailAddress: emailAddress.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already in use." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const biddingNumber = await generateUniqueBiddingNumber();

    const user = await User.create({
      firstName,
      lastName,
      cellPhone,
      emailAddress: emailAddress.toLowerCase(),
      password: hashedPassword,
      physicalAddress,
      biddingNumber,
      isVerified: false,
      verificationToken,
    });

    await sendVerificationEmail(user.emailAddress, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email before logging in.",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.emailAddress,
          cellPhone: user.cellPhone,
          physicalAddress: user.physicalAddress,
          biddingNumber: user.biddingNumber,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
  }
}
