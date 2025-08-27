import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/bidders
export async function GET() {
  try {
    await connectToDB();
    const users = await User.find({})
      .select("firstName lastName emailAddress biddingNumber isVerified isSuspended createdAt updatedAt cellPhone physicalAddress")
      .lean();

    const transformed = users.map((u) => ({
      id: u._id.toString(),
      name: `${u.firstName} ${u.lastName}`,
      email: u.emailAddress,
      biddingNumber: u.biddingNumber || "",
      status: u.isSuspended ? "Suspended" : "Active",
      isSuspended: u.isSuspended || false, // ensure all have this field
      ip: "-", // optional, keep as placeholder
      lastActivity: "-", // optional, keep as placeholder
      phone: u.cellPhone || "N/A",
      address: u.physicalAddress || "N/A",
    }));

    return new Response(JSON.stringify(transformed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// PATCH /api/bidders/:id
export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const body = await req.json();
    const { suspend } = body; // boolean: true = suspend, false = activate

    const user = await User.findById(id);
    if (!user) return new Response(JSON.stringify({ success: false, message: "User not found" }), { status: 404 });

    user.isSuspended = suspend;
    await user.save();

    return new Response(JSON.stringify({ success: true, message: "Status updated" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
