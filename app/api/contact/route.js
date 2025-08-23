import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

// ✅ POST - Save inquiry
export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const contact = new Contact({ name, email, message });
    await contact.save();

    return NextResponse.json(
      { success: true, message: "Message saved successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ GET - Fetch inquiries
export async function GET() {
  try {
    await connectToDB();

    const inquiries = await Contact.find().sort({ createdAt: -1 }); // latest first

    return NextResponse.json(
      { success: true, inquiries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
