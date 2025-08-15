// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = getTokenFromCookie(cookieHeader);
  const decoded = verifyToken(token);
  if (!decoded) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  if (decoded.role !== "admin") return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

  await dbConnect();
  const users = await User.find().select("-passwordHash").limit(200);
  return new Response(JSON.stringify({ users }), { status: 200 });
}
