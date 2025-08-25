"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
// import { socket } from "@/lib/socketClient"; // when you set up socket

export default function LotDetailsPage() {
  const { lotId } = useParams();
  const [lotData, setLotData] = useState(null);
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // ----- helpers -----
  const normalizeLot = (raw) => raw?.lot ?? raw?.data ?? raw;
  const normalizeLots = (raw) =>
    Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.lots)
      ? raw.lots
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
  const normalizeAuctions = (raw) =>
    Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.auctions)
      ? raw.auctions
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
  const toIdString = (val) =>
    typeof val === "string" ? val : (val?._id ?? val)?.toString?.() ?? "";

  // Fetch lot + auction data
  useEffect(() => {
    const fetchLot = async () => {
      try {
        const id = String(lotId);
        let lot = null;

        try {
          const lotRes = await fetch(`/api/lots/${id}`, { cache: "no-store" });
          if (lotRes.ok) lot = normalizeLot(await lotRes.json());
        } catch {}

        if (!lot) {
          const allLotsRes = await fetch("/api/lots", { cache: "no-store" });
          const allLots = normalizeLots(await allLotsRes.json());
          lot = allLots.find((l) => toIdString(l._id) === id) || null;
        }

        if (!lot) {
          setLotData(null);
          setAuction(null);
          return;
        }

        setLotData(lot);

        if (lot.auctionId) {
          try {
            const auctionRes = await fetch("/api/auctions", {
              cache: "no-store",
            });
            if (auctionRes.ok) {
              const auctions = normalizeAuctions(await auctionRes.json());
              const lotAuctionId = toIdString(lot.auctionId);
              setAuction(
                auctions.find((a) => toIdString(a._id) === lotAuctionId) || null
              );
            } else {
              setAuction(null);
            }
          } catch {
            setAuction(null);
          }
        } else {
          setAuction(null);
        }
      } catch (error) {
        console.error("Error fetching lot:", error);
      } finally {
        setLoading(false);
      }
    };

    if (lotId) fetchLot();
  }, [lotId]);

  // Countdown Timer
  useEffect(() => {
    if (!auction?.endDate) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = new Date(auction.endDate).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft(
          days > 0
            ? `${days}d ${hours}h ${minutes}m ${seconds}s`
            : `${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  // Place Bid
  const placeBid = () => {
    if (!lotData) return;
    const bidValue = parseFloat(bidAmount);
    const currentBid = lotData.currentBid || lotData.startingBid;

    if (!bidValue || bidValue <= currentBid) {
      alert("Your bid must be higher than the current bid.");
      return;
    }

    // socket.emit("placeBid", { lotId, bid: { amount: bidValue, user: "demoUser" } });

    setBidAmount("");
  };

  // Gallery controls
  const nextPhoto = () => {
    if (lotData.photos?.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === lotData.photos.length - 1 ? 0 : prev + 1
      );
    }
  };
  const prevPhoto = () => {
    if (lotData.photos?.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? lotData.photos.length - 1 : prev - 1
      );
    }
  };

  // UI states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!lotData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Lot not found.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link
          href="/sale-ring"
          className="inline-flex items-center gap-2 text-[#335566] hover:underline"
        >
          ← Back to Sale Ring
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Media */}
        <div>
          {lotData.photos?.length > 0 ? (
            <div className="relative mb-6">
              <Image
                src={lotData.photos[currentPhotoIndex]}
                alt={`${lotData.title} - Photo ${currentPhotoIndex + 1}`}
                width={800}
                height={500}
                className="rounded-xl shadow-lg w-full object-contain"
              />
              {lotData.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {lotData.photos.length}
                  </div>
                </>
              )}
              <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
                {lotData.status || "Active"}
              </span>
            </div>
          ) : lotData.video ? (
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <video controls className="w-full h-[400px] bg-black">
                <source src={lotData.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
              <p className="text-gray-500">No media available</p>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-4xl font-bold text-[#335566]">{lotData.title}</h1>

          <div className="mt-4 space-y-2">
            {lotData.abbi && (
              <p className="text-gray-700">
                <strong>ABBI:</strong> {lotData.abbi}
              </p>
            )}
            {lotData.sire && (
              <p className="text-gray-700">
                <strong>Sire:</strong> {lotData.sire}
              </p>
            )}
            {lotData.dam && (
              <p className="text-gray-700">
                <strong>Dam:</strong> {lotData.dam}
              </p>
            )}
          </div>

          {lotData.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {lotData.description}
            </p>
          )}

          {/* Auction Info */}
          <div className="mt-6 bg-[#f8fdfd] border border-[#e0f2f2] rounded-xl p-5 shadow-sm">
            <p className="text-xl font-semibold text-gray-800">
              Current Bid:{" "}
              <span className="text-[#335566]">
                ${lotData.currentBid || lotData.startingBid}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Starting Bid: ${lotData.startingBid}
            </p>
            {lotData.totalBids > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Total Bids: {lotData.totalBids}
              </p>
            )}
            {auction && (
              <>
                <p className="text-sm text-gray-500 mt-1">
                  Auction: {auction.title}
                </p>
                <p
                  className={`mt-3 font-semibold ${
                    timeLeft === "Auction Ended"
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  Time Left: {timeLeft || "Loading..."}
                </p>
              </>
            )}
          </div>

          {/* Bid Input */}
          {timeLeft !== "Auction Ended" ? (
            <div className="mt-6 flex">
              <input
                type="number"
                placeholder="Enter your bid"
                className="border text-black border-gray-300 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-[#6ED0CE]"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button
                onClick={placeBid}
                className="bg-[#6ED0CE] px-8 py-3 rounded-r-lg font-semibold text-[#335566] hover:bg-[#4DB1B1] transition"
              >
                Place Bid
              </button>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">
                This auction has ended
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Bids Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-[#335566] mb-4">Live Bids</h2>
          <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg p-4 space-y-3">
            {lotData?.bids?.length > 0 ? (
              lotData.bids.map((bid, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg shadow-sm"
                >
                  <span className="text-gray-700 font-medium">
                    💰 ${bid.amount}
                  </span>
                  <span className="text-sm text-gray-500">
                    {bid.user || "Anonymous"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No bids yet. Be the first!
              </p>
            )}
          </div>
        </div>
        {/* Dealer Details (Static Dummy for Now) */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-[#335566] mb-4">
              Dealer Details
            </h2>
            <p className="text-gray-700">
              <strong>Name:</strong> John Doe Motors
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> johndoe@example.com
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
