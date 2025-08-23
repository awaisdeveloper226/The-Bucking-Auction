import { connectToDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

// DELETE /api/contact/[id]
export async function DELETE(req, { params }) {
  await connectToDB();

  try {
    const { id } = params;
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ success: false, message: "Inquiry not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
