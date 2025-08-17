import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

/**
 * Reuse connection in dev to avoid too many connections on HMR.
 */
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "auction_portal",
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
