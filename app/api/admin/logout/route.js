// app/api/admin/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set({
    name: "adminId",
    value: "",
    path: "/",
    expires: new Date(0), // expire immediately
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
