import { connectToDB } from "@/lib/mongodb"; // create this helper if you don't have it
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();
    const users = await User.find({})
      .select("firstName lastName emailAddress biddingNumber isVerified createdAt updatedAt")
      .lean();

    // Transform data to match previous component
    const transformed = users.map((u, index) => ({
      id: u._id.toString(),
      name: `${u.firstName} ${u.lastName}`,
      email: u.emailAddress,
      bidderNumber: u.biddingNumber || "",
      status: u.isVerified ? "Active" : "Suspended",
      ip: "-", // you don't have IP in schema
      lastActivity: "-", // you don't have lastActivity in schema
    }));

    return new Response(JSON.stringify(transformed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
