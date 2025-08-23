import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function DELETE(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Bidder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDB();
    const { id } = params;
    const { suspend } = await req.json();

    if (typeof suspend !== "boolean") {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid suspend flag" }),
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isSuspended: suspend },
      { new: true }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: user.isSuspended ? "Suspended" : "Active",
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}