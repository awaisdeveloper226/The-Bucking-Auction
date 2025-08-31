"use client";
import { useState, useEffect } from "react";
import { Ban, CheckCircle, Trash2, Edit2, X, Unlock, Eye } from "lucide-react";

export default function BidderManagement() {
  const [bidders, setBidders] = useState([]);
  const [assignForm, setAssignForm] = useState({ id: "", number: "" });
  const [loading, setLoading] = useState(true);

  const [deleteBidderId, setDeleteBidderId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [suspending, setSuspending] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [viewBidder, setViewBidder] = useState(null); // For modal

  useEffect(() => {
    fetchBidders();
  }, []);

  // Fetch bidders from API
  const fetchBidders = async () => {
    try {
      const res = await fetch("/api/bidders");
      const data = await res.json();
      setBidders(data);
    } catch (err) {
      console.error("Error fetching bidders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirmSuspend) return;
    try {
      setSuspending(true);
      const res = await fetch(`/api/bidders/${confirmSuspend.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suspend: confirmSuspend.status === "Active" }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchBidders();
        setConfirmSuspend(null);
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error suspending bidder:", err);
    } finally {
      setSuspending(false);
    }
  };

  // ✅ Update bidder number in DB
  // ✅ Update bidder number in DB
  const assignBidderNumber = async () => {
    if (!assignForm.id || !assignForm.number) return;
    try {
      setAssigning(true);
      const res = await fetch(`/api/bidders/${assignForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biddingNumber: assignForm.number }), // 👈 fixed key name
      });
      const data = await res.json();

      if (data.success) {
        await fetchBidders(); // Refresh list from DB
        setAssignForm({ id: "", number: "" });
      } else {
        alert(data.message || "Failed to assign bidder number");
      }
    } catch (err) {
      console.error("Error assigning bidder number:", err);
    } finally {
      setAssigning(false);
    }
  };



  const handleDelete = async () => {
    if (!deleteBidderId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/bidders/${deleteBidderId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        await fetchBidders();
        setDeleteBidderId(null);
      } else {
        alert(data.message || "Failed to delete bidder");
      }
    } catch (err) {
      console.error("Error deleting bidder:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-6">Loading bidders...</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Bidder Management</h2>

      {/* Assign Bidder Number */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold mb-3">Assign Bidder Number</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Bidder ID"
            value={assignForm.id}
            onChange={(e) =>
              setAssignForm({ ...assignForm, id: e.target.value })
            }
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="number"
            placeholder="Bidder Number"
            value={assignForm.number}
            onChange={(e) =>
              setAssignForm({ ...assignForm, number: e.target.value })
            }
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={assignBidderNumber}
            disabled={assigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>

      {/* Bidders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Bidder #</th>
              <th className="p-3">Status</th>
              <th className="p-3">IP</th>

              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bidders.map((b) => (
              <tr
                key={b.id}
                className="border-t hover:bg-gray-50 transition duration-150"
              >
                <td className="p-3">{b.id}</td>
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3">{b.email}</td>
                <td className="p-3">{b.biddingNumber}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.isSuspended
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {b.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="p-3">{b.ip}</td>

                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() =>
                      setConfirmSuspend({ id: b.id, status: b.status })
                    }
                    className="text-red-500 hover:text-red-700"
                    title={
                      b.isSuspended ? "Unsuspend Bidder" : "Suspend Bidder"
                    }
                  >
                    {b.isSuspended ? (
                      <Unlock color="green" size={18} />
                    ) : (
                      <Ban size={18} />
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteBidderId(b.id)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Remove Bidder"
                  >
                    <Trash2 size={18} />
                  </button>
                  {/* Eye button for modal */}
                  <button
                    onClick={() => setViewBidder(b)}
                    className="text-indigo-500 hover:text-indigo-700"
                    title="View Bidder"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {viewBidder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <h2 className="text-xl font-bold mb-4">Bidder Details</h2>
            <p>
              <strong>Name:</strong> {viewBidder.name}
            </p>
            <p>
              <strong>Email:</strong> {viewBidder.email}
            </p>
            <p>
              <strong>Phone:</strong> {viewBidder.phone || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {viewBidder.address || "N/A"}
            </p>

            <button
              onClick={() => setViewBidder(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBidderId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              onClick={() => setDeleteBidderId(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this bidder?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteBidderId(null)}
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

      {/* Suspend Confirmation Modal */}
      {confirmSuspend && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
            <button
              onClick={() => setConfirmSuspend(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {confirmSuspend.status === "Active"
                ? "Suspend Bidder"
                : "Activate Bidder"}
            </h3>

            <p className="mb-6">
              Are you sure you want to{" "}
              {confirmSuspend.status === "Active" ? "suspend" : "activate"} this
              bidder?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmSuspend(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSuspend}
                disabled={suspending}
                className={`px-4 py-2 rounded-lg ${
                  confirmSuspend.status === "Active"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {suspending
                  ? "Processing..."
                  : confirmSuspend.status === "Active"
                  ? "Suspend"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
