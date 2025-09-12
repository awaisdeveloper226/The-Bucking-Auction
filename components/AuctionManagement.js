"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [bidders, setBidders] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    start: "",
    end: "",
    visibility: "Draft",
    autoExtend: true,
    flyer: null,
  });

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();
        if (data.success) setAuctions(data.auctions);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const res = await fetch("/api/bidders");
        if (!res.ok) throw new Error("Failed to fetch bidders");
        const users = await res.json();

        // Create bidders map with both possible key formats
        const map = {};
        users.forEach((u) => {
          // Store with the transformed 'id' key from your API
          map[u.id] = u;
          // Also store with the original MongoDB ObjectId format if different
          // This ensures compatibility with both formats
          if (u.id !== u._id) {
            map[u._id] = u;
          }
        });
        setBidders(map);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBidders();
  }, []);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const res = await fetch("/api/lots");
        if (!res.ok) throw new Error("Failed to fetch lots");
        const data = await res.json();
        setLots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();

    const interval = setInterval(fetchLots, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const uploadFlyer = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.secure_url;
  };

  const toLocalISOString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      startingBid: "",
      flyer: null,
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAuction = async () => {
    if (!form.name || !form.start || !form.end) return;
    setUploading(true);

    try {
      let flyerUrl = null;
      if (form.flyer instanceof File) flyerUrl = await uploadFlyer(form.flyer);
      else if (typeof form.flyer === "string") flyerUrl = form.flyer;

      const startUTC = new Date(form.start).toISOString();
      const endUTC = new Date(form.end).toISOString();

      const payload = {
        title: form.name,
        description: form.description,
        flyer: flyerUrl,
        startDate: startUTC,
        endDate: endUTC,
        startingBid: Number(form.reserve),
        status: form.visibility.toLowerCase(),
        autoExtend: form.autoExtend,
      };

      const url = editingId ? `/api/auctions/${editingId}` : "/api/auctions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (editingId) {
          setAuctions(
            auctions.map((a) => (a._id === editingId ? data.auction : a))
          );
        } else {
          setAuctions([data.auction, ...auctions]);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Error saving auction:", error);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/auctions/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) setAuctions(auctions.filter((a) => a._id !== deleteId));
    } catch (error) {
      console.error("Error deleting auction:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (auction) => {
    setEditingId(auction._id);
    setForm({
      name: auction.title,
      description: auction.description,
      start: toLocalISOString(auction.startDate),
      end: toLocalISOString(auction.endDate),
      visibility:
        auction.status.charAt(0).toUpperCase() + auction.status.slice(1),
      autoExtend: auction.autoExtend,
      flyer: auction.flyer || null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewAuction = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDate);
    const end = new Date(auction.endDate);

    if (end < now) {
      router.push(`/past-auctions`);
    } else if (start > now) {
      router.push(`/upcoming-auctions`);
    } else {
      router.push(`/sale-ring/${auction._id}`);
    }
  };

  // Helper function to get bidder info with better error handling
  const getBidderInfo = (bid) => {
    let userId = "";

    try {
      // Handle different possible formats of bid.user
      if (typeof bid.user === "object" && bid.user !== null) {
        if (bid.user._id) {
          userId = String(bid.user._id);
        } else if (bid.user.toString) {
          userId = bid.user.toString();
        }
      } else if (bid.user) {
        userId = String(bid.user);
      }

      // Also try bid.userId if bid.user doesn't exist
      if (!userId && bid.userId) {
        if (typeof bid.userId === "object" && bid.userId !== null) {
          if (bid.userId._id) {
            userId = String(bid.userId._id);
          } else if (bid.userId.toString) {
            userId = bid.userId.toString();
          }
        } else {
          userId = String(bid.userId);
        }
      }
    } catch (e) {
      console.error("Error processing bid user ID:", e, bid);
    }

    // Try to find user in bidders map
    const user = bidders[userId];

    if (user) {
      return {
        name: user.name,
        biddingNumber: user.biddingNumber || "N/A",
        amount: bid.amount,
      };
    } else {
      // Log for debugging
      console.log(
        "User not found for ID:",
        userId,
        "Available bidder IDs:",
        Object.keys(bidders)
      );
      return {
        name: "Unknown User",
        biddingNumber: "N/A",
        amount: bid.amount,
      };
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md space-y-6 relative">
      <h2 className="text-2xl font-bold mb-6">Auction Management</h2>

      {/* Auction Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Auction Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter auction name"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a short description..."
            rows="4"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            name="start"
            value={form.start}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            name="end"
            value={form.end}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Visibility</label>
          <select
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Auction Flyer
          </label>
          <div
            onClick={() => document.getElementById("flyerUpload").click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition w-full"
          >
            {form.flyer ? (
              <img
                src={
                  form.flyer instanceof File
                    ? URL.createObjectURL(form.flyer)
                    : form.flyer?.includes("/upload/")
                    ? form.flyer.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_400/"
                      )
                    : form.flyer
                }
                alt="Flyer Preview"
                className="h-40 w-auto rounded-lg shadow-md object-contain"
                loading="lazy"
              />
            ) : (
              <>
                <svg
                  className="w-10 h-10 text-blue-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 010 10h-1M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600 text-sm">
                  Drag & drop flyer here or{" "}
                  <span className="text-blue-500 font-medium">browse</span>
                </p>
              </>
            )}
          </div>
          <input
            id="flyerUpload"
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, flyer: e.target.files[0] })}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={saveAuction}
          disabled={uploading}
          className={`px-5 py-2 rounded-lg shadow text-white w-full sm:w-auto ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading
            ? "Saving..."
            : editingId
            ? "Update Auction"
            : "Create Auction"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            type="button"
            className="px-5 py-2 rounded-lg shadow text-white w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Create New Auction
          </button>
        )}
      </div>

      {/* Auction Table */}
      <div className="mt-8 overflow-x-auto">
        {loading ? (
          <p className="text-gray-500">Loading auctions...</p>
        ) : (
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3">Visibility</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{auction.title}</td>
                  <td className="p-3">
                    {new Date(auction.startDate).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(auction.endDate).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        auction.status === "published"
                          ? "bg-green-100 text-green-700"
                          : auction.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {auction.status}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(auction)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(auction._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleViewAuction(auction)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Auction View */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <Play className="mr-2 text-blue-600" /> Live Auction View
        </h3>

        {loading ? (
          <p className="text-gray-700">Loading lots...</p>
        ) : lots.length === 0 ? (
          <p className="text-gray-700">No lots available.</p>
        ) : (
          <div className="space-y-4">
            {lots.map((lot) => (
              <div
                key={lot._id}
                className="p-4 bg-white rounded-lg shadow border border-gray-200"
              >
                <h4 className="font-semibold text-lg">{lot.title}</h4>
                <p className="text-gray-600">
                  Starting Bid: ${lot.startingBid}
                </p>
                <p className="text-gray-700 font-medium">
                  Current Bids: {lot.bids?.length || 0}
                </p>

                {lot.bids && lot.bids.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    {lot.bids.map((bid, idx) => {
                      const bidderInfo = getBidderInfo(bid);

                      return (
                        <li key={idx}>
                          <span className="font-semibold">
                            {bidderInfo.name}
                          </span>{" "}
                          (#{bidderInfo.biddingNumber}) — ${bidderInfo.amount}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this auction? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
