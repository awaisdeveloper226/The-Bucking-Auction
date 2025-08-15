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

  // Example lots array (same as sale-ring page)
  const lots = [
    { id: 1, title: "Lot 1 – Premium Angus Bull", bid: 2500, status: "Live", img: "/images/lot1.jpg", description: "A top-quality Angus bull with excellent genetics, ideal for breeding programs. Vaccinated and vet-checked.", reservePrice: 2000, seller: "John Doe Ranch", sellerPhone: "+1 555-123-4567", sellerEmail: "seller@example.com", video: "/videos/lots/lot1.mp4", endTime: new Date().getTime() + 2 * 60 * 60 * 1000 },
    { id: 2, title: "Lot 2 – Champion Heifer", bid: 1800, status: "Live", img: "/images/lot2.jpg", description: "Champion heifer with excellent lineage.", reservePrice: 1500, seller: "Green Pastures", sellerPhone: "+1 555-987-6543", sellerEmail: "heifer@example.com", video: "/videos/lots/lot2.mp4", endTime: new Date().getTime() + 3 * 60 * 60 * 1000 },
    { id: 3, title: "Lot 3 – Registered Hereford Bull", bid: 3000, status: "Live", img: "/images/lot3.jpg", description: "Registered Hereford bull for high-quality breeding.", reservePrice: 2500, seller: "Red Valley Ranch", sellerPhone: "+1 555-246-8100", sellerEmail: "hereford@example.com", video: "/videos/lots/lot3.mp4", endTime: new Date().getTime() + 4 * 60 * 60 * 1000 },
    { id: 4, title: "Lot 4 – Purebred Charolais", bid: 2200, status: "Live", img: "/images/lot4.jpg", description: "Purebred Charolais for premium meat and breeding.", reservePrice: 2000, seller: "White Hills Farm", sellerPhone: "+1 555-369-1212", sellerEmail: "charolais@example.com", video: "/videos/lots/lot4.mp4", endTime: new Date().getTime() + 5 * 60 * 60 * 1000 },
  ];

  // Find the lot matching the slug ID
  useEffect(() => {
    const lot = lots.find((l) => l.id === parseInt(lotId));
    setLotData(lot || null);
  }, [lotId]);

  // Countdown Timer
  useEffect(() => {
    if (!lotData) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = lotData.endTime - now;

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
    if (!bidValue || bidValue <= lotData.bid) {
      alert("Your bid must be higher than the current bid.");
      return;
    }
    alert(`Bid of $${bidValue} placed successfully!`);
  };

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
        {/* Left: Image + Video */}
        <div>
          <div className="relative">
            <Image
              src={lotData.img}
              alt={lotData.title}
              width={800}
              height={500}
              className="rounded-xl shadow-lg w-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
              {lotData.status || "Live Auction"}
            </span>
          </div>

          {lotData.video && (
            <video
              controls
              className="mt-6 w-full rounded-xl shadow-lg border border-gray-200"
            >
              <source src={lotData.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-4xl font-bold text-[#335566]">{lotData.title}</h1>
          <p className="mt-4 text-gray-700 leading-relaxed">{lotData.description}</p>

          {/* Auction Info */}
          <div className="mt-6 bg-[#f8fdfd] border border-[#e0f2f2] rounded-xl p-5 shadow-sm">
            <p className="text-xl font-semibold text-gray-800">
              Current Bid: <span className="text-[#335566]">${lotData.bid}</span>
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

          {/* Seller Info */}
          <div className="mt-8 bg-[#f3f8f8] p-5 rounded-xl border border-[#e0f2f2] shadow-sm">
            <h3 className="text-lg font-bold text-[#335566]">Seller Information</h3>
            <p className="mt-1 text-black">{lotData.seller}</p>
            <p className="mt-1 text-black">📞 {lotData.sellerPhone}</p>
            <p className="mt-1 text-black">✉️ {lotData.sellerEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
