"use client";

import { useEffect, useState } from "react";
import { Eye, Trash2, Loader2, X } from "lucide-react";

export default function UserInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteInquiryId, setDeleteInquiryId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteInquiryId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/contact/${deleteInquiryId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.filter((inq) => inq._id !== deleteInquiryId)
        );
        setDeleteInquiryId(null);
      } else {
        alert("Failed to delete inquiry.");
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md relative min-h-[400px]">
      <h2 className="text-2xl font-bold mb-6">User Inquiries</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : inquiries.length === 0 ? (
        <p className="text-center text-gray-500">No inquiries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Message</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{inq.name}</td>
                  <td className="p-3 text-blue-600">{inq.email}</td>
                  <td className="p-3 max-w-xs truncate">{inq.message}</td>
                  <td className="p-3">
                    {new Date(inq.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setSelectedInquiry(inq)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteInquiryId(inq._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Inquiry Details</h3>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {selectedInquiry.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {selectedInquiry.email}
              </p>
              <p>
                <span className="font-semibold">Message:</span>
                <br />
                {selectedInquiry.message}
              </p>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(selectedInquiry.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteInquiryId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this inquiry?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteInquiryId(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
