"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Play } from "lucide-react";

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    start: "",
    end: "",
    reserve: "",
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadFlyer = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.secure_url;
  };

  const addAuction = async () => {
    if (!form.name || !form.start || !form.end) return;
    setUploading(true);

    try {
      let flyerUrl = null;
      if (form.flyer) flyerUrl = await uploadFlyer(form.flyer);

      const payload = {
        title: form.name,
        description: form.description,
        flyer: flyerUrl,
        startDate: form.start,
        endDate: form.end,
        startingBid: Number(form.reserve),
        status: form.visibility.toLowerCase(),
        autoExtend: form.autoExtend,
      };

      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setAuctions([data.auction, ...auctions]);
        setForm({
          name: "",
          description: "",
          start: "",
          end: "",
          reserve: "",
          visibility: "Draft",
          autoExtend: true,
          flyer: null,
        });
      }
    } catch (error) {
      console.error("Error creating auction:", error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAuction = async (id) => {
    try {
      const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setAuctions(auctions.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting auction:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md space-y-6">
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
          <label className="mb-1 font-medium text-gray-700">Reserve Price</label>
          <input
            type="number"
            name="reserve"
            value={form.reserve}
            onChange={handleChange}
            placeholder="Hidden until met"
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
          <label className="mb-1 font-medium text-gray-700">Auction Flyer</label>
          <div
            onClick={() => document.getElementById("flyerUpload").click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition w-full"
          >
            {form.flyer ? (
              <img
                src={URL.createObjectURL(form.flyer)}
                alt="Flyer Preview"
                className="h-40 w-auto rounded-lg shadow-md"
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
                  Drag & drop flyer here or <span className="text-blue-500 font-medium">browse</span>
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

        <div className="flex items-center space-x-3 mt-4 md:col-span-2">
          <input
            type="checkbox"
            checked={form.autoExtend}
            onChange={() => setForm({ ...form, autoExtend: !form.autoExtend })}
            className="w-5 h-5 text-blue-500 rounded"
          />
          <span className="text-gray-700">Auto-extend 5 mins if bid placed in last 5 mins</span>
        </div>
      </div>

      <button
        onClick={addAuction}
        disabled={uploading}
        className={`px-5 py-2 rounded-lg shadow text-white w-full sm:w-auto ${
          uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Create Auction"}
      </button>

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
                <th className="p-3">Reserve</th>
                <th className="p-3">Visibility</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr key={auction._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{auction.title}</td>
                  <td className="p-3">{new Date(auction.startDate).toLocaleString()}</td>
                  <td className="p-3">{new Date(auction.endDate).toLocaleString()}</td>
                  <td className="p-3">${auction.startingBid}</td>
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
                    <button className="text-blue-500 hover:text-blue-700">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => deleteAuction(auction._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Real-Time Auction Placeholder */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <Play className="mr-2 text-blue-600" /> Live Auction View
        </h3>
        <p className="text-gray-700">
          Real-time auction updates with live bids will be shown here.
        </p>
      </div>
    </div>
  );
}
