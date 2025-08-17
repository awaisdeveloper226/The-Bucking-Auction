import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: "Invalid token" }), { status: 400 });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "Token not found" }), { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return new Response(JSON.stringify({ success: true, message: "Email verified successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
