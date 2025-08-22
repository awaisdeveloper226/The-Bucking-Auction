"use client";
import { useState, useEffect } from "react";
import { Ban, CheckCircle, Trash2, Edit2 } from "lucide-react";

export default function BidderManagement() {
  const [bidders, setBidders] = useState([]);
  const [assignForm, setAssignForm] = useState({ id: "", number: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBidders();
  }, []);

  const fetchBidders = async () => {
    try {
      const res = await fetch("/api/bidders");
      const data = await res.json();
      setBidders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setBidders(
      bidders.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "Active" ? "Suspended" : "Active" }
          : b
      )
    );
  };

  const assignBidderNumber = () => {
    if (!assignForm.id || !assignForm.number) return;
    setBidders(
      bidders.map((b) =>
        b.id === assignForm.id
          ? { ...b, bidderNumber: assignForm.number }
          : b
      )
    );
    setAssignForm({ id: "", number: "" });
  };

  const overrideBid = (id) => alert(`Bid overridden for bidder #${id}`);
  const proxyBid = (id) => alert(`Proxy bid placed for bidder #${id}`);
  const deleteBidder = (id) => setBidders(bidders.filter((b) => b.id !== id));

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Assign
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
              <th className="p-3">Last Activity</th>
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
                <td className="p-3">{b.bidderNumber}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3">{b.ip}</td>
                <td className="p-3">{b.lastActivity}</td>
                <td className="p-3 flex space-x-3">
                  <button
                    onClick={() => toggleStatus(b.id)}
                    className="text-red-500 hover:text-red-700"
                    title={
                      b.status === "Active" ? "Suspend Bidder" : "Activate Bidder"
                    }
                  >
                    <Ban size={18} />
                  </button>
                  <button
                    onClick={() => overrideBid(b.id)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Override Bid"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => proxyBid(b.id)}
                    className="text-green-500 hover:text-green-700"
                    title="Proxy Bid"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => deleteBidder(b.id)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Remove Bidder"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
