"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LotDetailsPage() {
  const { lotId } = useParams();
  const [lotData, setLotData] = useState(null);
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Fetch lot data from API
  useEffect(() => {
    const fetchLot = async () => {
      try {
        // First, get the specific lot
        const lotRes = await fetch(`/api/lots/${lotId}`);
        if (!lotRes.ok) {
          // Fallback: get all lots and find the one we need
          const allLotsRes = await fetch("/api/lots");
          const allLotsData = await allLotsRes.json();
          
          let allLots = [];
          if (Array.isArray(allLotsData)) {
            allLots = allLotsData;
          } else if (allLotsData.lots && Array.isArray(allLotsData.lots)) {
            allLots = allLotsData.lots;
          }
          
          const foundLot = allLots.find(lot => lot._id === lotId);
          if (foundLot) {
            setLotData(foundLot);
            
            // Get the auction details for this lot
            if (foundLot.auctionId) {
              const auctionRes = await fetch("/api/auctions");
              const auctionData = await auctionRes.json();
              
              let auctions = [];
              if (auctionData.success && auctionData.auctions) {
                auctions = auctionData.auctions;
              } else if (Array.isArray(auctionData)) {
                auctions = auctionData;
              }
              
              const foundAuction = auctions.find(
                auction => auction._id === (foundLot.auctionId._id || foundLot.auctionId)
              );
              setAuction(foundAuction);
            }
          }
        } else {
          const lotData = await lotRes.json();
          setLotData(lotData);
          
          // Get auction details
          if (lotData.auctionId) {
            const auctionRes = await fetch("/api/auctions");
            const auctionData = await auctionRes.json();
            
            let auctions = [];
            if (auctionData.success && auctionData.auctions) {
              auctions = auctionData.auctions;
            } else if (Array.isArray(auctionData)) {
              auctions = auctionData;
            }
            
            const foundAuction = auctions.find(
              auction => auction._id === (lotData.auctionId._id || lotData.auctionId)
            );
            setAuction(foundAuction);
          }
        }
      } catch (error) {
        console.error("Error fetching lot:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (lotId) {
      fetchLot();
    }
  }, [lotId]);

  // Countdown Timer - based on auction end date
  useEffect(() => {
    if (!auction?.endDate) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(auction.endDate).getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const placeBid = () => {
    if (!lotData) return;
    const bidValue = parseFloat(bidAmount);
    const currentBid = lotData.currentBid || lotData.startingBid;
    
    if (!bidValue || bidValue <= currentBid) {
      alert("Your bid must be higher than the current bid.");
      return;
    }
    
    // Here you would typically make an API call to place the bid
    alert(`Bid of $${bidValue} placed successfully for ${lotData.title}!`);
    setBidAmount("");
  };

  const nextPhoto = () => {
    if (lotData.photos && lotData.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === lotData.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (lotData.photos && lotData.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? lotData.photos.length - 1 : prev - 1
      );
    }
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
        {/* Left: Images + Videos */}
        <div>
          {/* Photo Gallery */}
          {lotData.photos && lotData.photos.length > 0 && (
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
          )}

          {/* Video Gallery */}
          {lotData.videos && lotData.videos.length > 0 && (
            <div className="space-y-4">
              {lotData.videos.map((video, index) => (
                <video
                  key={index}
                  controls
                  className="w-full rounded-xl shadow-lg border border-gray-200"
                >
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}

          {/* Fallback if no media */}
          {(!lotData.photos || lotData.photos.length === 0) && 
           (!lotData.videos || lotData.videos.length === 0) && (
            <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
              <p className="text-gray-500">No media available</p>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-4xl font-bold text-[#335566]">{lotData.title}</h1>
          
          {/* Lot Details */}
          <div className="mt-4 space-y-2">
            {lotData.abbi && (
              <p className="text-gray-700"><strong>ABBI:</strong> {lotData.abbi}</p>
            )}
            {lotData.sire && (
              <p className="text-gray-700"><strong>Sire:</strong> {lotData.sire}</p>
            )}
            {lotData.dam && (
              <p className="text-gray-700"><strong>Dam:</strong> {lotData.dam}</p>
            )}
          </div>

          {lotData.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">{lotData.description}</p>
          )}

          {/* Auction Info */}
          <div className="mt-6 bg-[#f8fdfd] border border-[#e0f2f2] rounded-xl p-5 shadow-sm">
            <p className="text-xl font-semibold text-gray-800">
              Current Bid: <span className="text-[#335566]">${lotData.currentBid || lotData.startingBid}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Starting Bid: ${lotData.startingBid}
            </p>
            {auction && (
              <>
                <p className="text-sm text-gray-500 mt-1">
                  Auction: {auction.title}
                </p>
                <p
                  className={`mt-3 font-semibold ${
                    timeLeft === "Auction Ended" ? "text-red-500" : "text-green-600"
                  }`}
                >
                  Time Left: {timeLeft || "Loading..."}
                </p>
              </>
            )}
          </div>

          {/* Bid Input */}
          {timeLeft !== "Auction Ended" && (
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
          )}

          {timeLeft === "Auction Ended" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-semibold">This auction has ended</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}