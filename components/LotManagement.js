"use client";
import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Upload,
  GripVertical,
  X,
  Plus,
  Play,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ExcelUploadHandler from "./ExcelUploadHandler";

export default function LotManagement() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // track deletion modal

  // Auctions fetched from API
  const [auctions, setAuctions] = useState([]);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    abbi: "",
    sire: "",
    dam: "",
    age: "",
    sellerName: "",
    sellerMobile: "",
    sellerEmail: "",
    startingBid: "",
    photos: [], // Array of photo URLs
    videos: [], // Array of video URLs
    auctionId: "",
  });

  // Upload states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  // ✅ Fetch auctions from API safely
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();

        const fetched = Array.isArray(data)
          ? data
          : Array.isArray(data.auctions)
          ? data.auctions
          : [];
        setAuctions(fetched);
      } catch (err) {
        console.error("Failed to fetch auctions:", err);
        setAuctions([]);
      }
    };
    fetchAuctions();
  }, []);

  // Fetch lots from API
  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/lots");
      const data = await res.json();
      setLots(Array.isArray(data) ? data : data.lots || []);
    } catch (err) {
      console.error("Failed to fetch lots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Upload files to Cloudinary
  const uploadToCloudinary = async (files, resourceType = "image") => {
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset"
      );
      formData.append("resource_type", resourceType);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    return uploadedUrls;
  };

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const urls = await uploadToCloudinary(files, "image");
      setForm({
        ...form,
        photos: [...form.photos, ...urls],
      });
    } catch (error) {
      console.error("Photo upload failed:", error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingVideos(true);
    try {
      const urls = await uploadToCloudinary(files, "video");
      setForm({
        ...form,
        videos: [...form.videos, ...urls],
      });
    } catch (error) {
      console.error("Video upload failed:", error);
    } finally {
      setUploadingVideos(false);
    }
  };

  // Remove photo
  const removePhoto = (index) => {
    const newPhotos = form.photos.filter((_, i) => i !== index);
    setForm({ ...form, photos: newPhotos });
  };

  // Remove video
  const removeVideo = (index) => {
    const newVideos = form.videos.filter((_, i) => i !== index);
    setForm({ ...form, videos: newVideos });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      abbi: "",
      sire: "",
      dam: "",
      age: "",
      sellerName: "",
      sellerMobile: "",
      sellerEmail: "",
      startingBid: "",
      photos: [],
      videos: [],
      auctionId: "",
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top
  };

  // ADD or UPDATE lot
  const saveLot = async () => {
    if (!form.title || !form.auctionId) return;

    setUploading(true);
    try {
      const payload = {
        ...form,
        startingBid: Number(form.startingBid),
      };

      const url = editingId ? `/api/lots?id=${editingId}` : "/api/lots";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          // Update existing lot in the list
          setLots(lots.map((lot) => (lot._id === editingId ? data : lot)));
        } else {
          // Add new lot to the list
          setLots([data, ...lots]);
        }
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save lot:", error);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/lots?id=${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLots(lots.filter((lot) => lot._id !== deleteId));
      }
    } catch (error) {
      console.error("Failed to delete lot:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (lot) => {
    setEditingId(lot._id);
    setForm({
      title: lot.title || "",
      description: lot.description || "",
      abbi: lot.abbi || "",
      sire: lot.sire || "",
      dam: lot.dam || "",
      age: lot.age || "",
      sellerName: lot.sellerName || "",
      sellerMobile: lot.sellerMobile || "",
      sellerEmail: lot.sellerEmail || "",
      startingBid: lot.startingBid?.toString() || "",
      photos: lot.photos || [],
      videos: lot.videos || [],
      auctionId: lot.auctionId || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lots);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setLots(reordered);
    // You can also send the new order to the API here
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md space-y-6 relative">
      <h2 className="text-2xl font-bold mb-4">Lot Management</h2>

      {/* Bulk Upload */}
      <ExcelUploadHandler auctions={auctions} onUploadComplete={fetchLots} />

      {/* Lot Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-4">
        {/* Auction Dropdown */}
        <div>
          <label htmlFor="auctionId" className="block mb-1 font-medium">
            Auction
          </label>
          <select
            id="auctionId"
            name="auctionId"
            value={form.auctionId}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          >
            <option value="">Select Auction</option>
            {auctions.map((auction) => (
              <option key={auction._id} value={auction._id}>
                {auction.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Lot Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Lot Title"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="abbi" className="block mb-1 font-medium">
            ABBI #
          </label>
          <input
            id="abbi"
            type="text"
            name="abbi"
            value={form.abbi}
            onChange={handleChange}
            placeholder="ABBI #"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="sire" className="block mb-1 font-medium">
            Sire
          </label>
          <input
            id="sire"
            type="text"
            name="sire"
            value={form.sire}
            onChange={handleChange}
            placeholder="Sire"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="dam" className="block mb-1 font-medium">
            Dam
          </label>
          <input
            id="dam"
            type="text"
            name="dam"
            value={form.dam}
            onChange={handleChange}
            placeholder="Dam"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="age" className="block mb-1 font-medium">
            Age (years)
          </label>
          <input
            id="age"
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            placeholder="Age (years)"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="sellerName" className="block mb-1 font-medium">
            Seller Name
          </label>
          <input
            id="sellerName"
            type="text"
            name="sellerName"
            value={form.sellerName}
            onChange={handleChange}
            placeholder="Seller Name"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="sellerMobile" className="block mb-1 font-medium">
            Seller Mobile Number
          </label>
          <input
            id="sellerMobile"
            type="tel"
            name="sellerMobile"
            value={form.sellerMobile}
            onChange={handleChange}
            placeholder="Seller Mobile Number"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="sellerEmail" className="block mb-1 font-medium">
            Seller Email
          </label>
          <input
            id="sellerEmail"
            type="email"
            name="sellerEmail"
            value={form.sellerEmail}
            onChange={handleChange}
            placeholder="Seller Email"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>

        <div>
          <label htmlFor="startingBid" className="block mb-1 font-medium">
            Starting Bid
          </label>
          <input
            id="startingBid"
            type="number"
            name="startingBid"
            value={form.startingBid}
            onChange={handleChange}
            placeholder="Starting Bid"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          rows={3}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
        />
      </div>

      {/* Photo Upload Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Photos</label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
              disabled={uploadingPhotos}
            />
            <label
              htmlFor="photo-upload"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="mr-2" size={18} />
              {uploadingPhotos ? "Uploading..." : "Add Photos"}
            </label>
          </div>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {form.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-full bg-gray-200 rounded-lg border overflow-hidden">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Videos</label>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
              disabled={uploadingVideos}
            />
            <label
              htmlFor="video-upload"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="mr-2" size={18} />
              {uploadingVideos ? "Uploading..." : "Add Videos"}
            </label>
          </div>

          {form.videos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {form.videos.map((video, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-24 bg-gray-200 rounded-lg border overflow-hidden">
                    <video src={video} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="text-white" size={24} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={saveLot}
          disabled={uploading}
          className={`px-5 py-2 rounded-lg shadow text-white w-full sm:w-auto ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Saving..." : editingId ? "Update Lot" : "Add Lot"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            type="button"
            className="px-5 py-2 rounded-lg shadow text-white w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Create New Lot
          </button>
        )}
      </div>

      {/* Lot List with Drag & Drop */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Existing Lots</h3>
        {loading ? (
          <div className="text-center py-8">Loading lots...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lots">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {lots.map((lot, index) => (
                    <Draggable
                      key={lot._id || lot.id}
                      draggableId={lot._id || lot.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          className="flex flex-col md:flex-row md:items-center md:justify-between w-full p-4 bg-gray-50 rounded-lg border shadow-sm hover:bg-gray-100 transition"
                        >
                          <div className="flex items-start md:items-center md:space-x-4 w-full md:w-auto flex-wrap">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab text-gray-500 mb-2 md:mb-0"
                            >
                              <GripVertical size={20} />
                            </div>

                            {/* Display first photo or placeholder */}
                            <img
                              src={
                                lot.photos?.[0] ||
                                "https://via.placeholder.com/80"
                              }
                              alt={lot.title}
                              className="w-20 h-20 object-cover rounded mb-2 md:mb-0"
                            />

                            <div className="flex-1 min-w-[150px]">
                              <h3 className="font-bold">{lot.title}</h3>
                              <p className="text-sm text-gray-600">
                                ABBI: {lot.abbi} | {lot.sire} × {lot.dam}
                              </p>
                              <p className="text-sm text-gray-600">
                                Age: {lot.age} years | Starting Bid: $
                                {lot.startingBid}
                              </p>
                              <p className="text-sm text-gray-600">
                                Seller: {lot.sellerName || "N/A"}
                              </p>
                              {lot.sellerMobile && (
                                <p className="text-xs text-gray-500">
                                  Mobile: {lot.sellerMobile}
                                </p>
                              )}
                              {lot.sellerEmail && (
                                <p className="text-xs text-gray-500">
                                  Email: {lot.sellerEmail}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Photos: {lot.photos?.length || 0} | Videos:{" "}
                                {lot.videos?.length || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                Auction: {lot.auctionId?.title || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <button
                              onClick={() => startEdit(lot)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteId(lot._id || lot.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
              Are you sure you want to delete this lot? This action cannot be
              undone.
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
