import jwt from "jsonwebtoken";
import dbConnect from "./mongodb";

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map(s => s.trim());
  for (const c of cookies) {
    if (c.startsWith("token=")) {
      return c.split("=").slice(1).join("=");
    }
  }
  return null;
}

export async function getUserFromToken(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;

  await dbConnect();

  // Import User model only after DB is connected
  const { default: User } = await import("@/models/User");

  const user = await User.findById(decoded.userId).select("-passwordHash");
  if (!user) return null;

  return {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified
  };
}
