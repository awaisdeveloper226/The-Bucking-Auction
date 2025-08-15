import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "No token provided" }), { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400 });
    }

    user.emailVerified = true;
    await user.save();

    return new Response(JSON.stringify({ message: "Email verified successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 });
  }
}
