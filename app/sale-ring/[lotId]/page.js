"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LotDetailsPage() {
  const { lotId } = useParams();
  const [lotData, setLotData] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch lot data from API
  useEffect(() => {
    const fetchLot = async () => {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();
        if (data.success) {
          const lot = data.auctions.find(
            (auction) => auction._id === lotId && auction.status === "published"
          );
          setLotData(lot || null);
        }
      } catch (error) {
        console.error("Error fetching lot:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [lotId]);

  // Countdown Timer
  useEffect(() => {
    if (!lotData) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(lotData.endDate).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      } else {
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lotData]);

  const placeBid = () => {
    if (!lotData) return;
    const bidValue = parseFloat(bidAmount);
    if (!bidValue || bidValue <= lotData.startingBid) {
      alert("Your bid must be higher than the current bid.");
      return;
    }
    alert(`Bid of $${bidValue} placed successfully!`);
  };

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
        Lot not found or not published.
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
        {/* Left: Image + Video */}
        <div>
          <div className="relative">
            {lotData.flyer && (
              <Image
                src={lotData.flyer}
                alt={lotData.title}
                width={800}
                height={500}
                className="rounded-xl shadow-lg w-full object-contain"
              />
            )}
            {lotData.video && (
              <video
                controls
                className="mt-6 w-full rounded-xl shadow-lg border border-gray-200"
              >
                <source src={lotData.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
              {lotData.status || "Live Auction"}
            </span>
          </div>
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-4xl font-bold text-[#335566]">{lotData.title}</h1>
          <p className="mt-4 text-gray-700 leading-relaxed">{lotData.description}</p>

          {/* Auction Info */}
          <div className="mt-6 bg-[#f8fdfd] border border-[#e0f2f2] rounded-xl p-5 shadow-sm">
            <p className="text-xl font-semibold text-gray-800">
              Current Bid: <span className="text-[#335566]">${lotData.startingBid}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Reserve Price: ${lotData.reservePrice}
            </p>
            <p
              className={`mt-3 font-semibold ${
                timeLeft === "Auction Ended" ? "text-red-500" : "text-green-600"
              }`}
            >
              Time Left: {timeLeft}
            </p>
          </div>

          {/* Bid Input */}
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

         
        </div>
      </div>
    </div>
  );
}
