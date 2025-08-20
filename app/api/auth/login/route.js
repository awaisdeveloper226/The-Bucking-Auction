import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectToDB();
    const { emailAddress, password } = await req.json();

    const user = await User.findOne({ emailAddress });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 400 });
    }

    if (!user.isVerified) {
      return new Response(JSON.stringify({ success: false, message: "Please verify your email first." }), { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), { status: 401 });
    }

    const safeUser = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      cellPhone: user.cellPhone,
      emailAddress: user.emailAddress,
      physicalAddress: user.physicalAddress,
      biddingNumber: user.biddingNumber,
    };

    return new Response(JSON.stringify({ success: true, user: safeUser }), { status: 200 });
  } catch (err) {
    console.error("Login API Error:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
