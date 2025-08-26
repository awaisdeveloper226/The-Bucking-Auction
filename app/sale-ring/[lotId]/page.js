"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function LotDetailsPage() {
  const { lotId } = useParams();
  const [lotData, setLotData] = useState(null);
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const socketRef = useRef(null);
  const bidsContainerRef = useRef(null);

  // Generate user info
  const getUserInfo = useCallback(() => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("userId", userId);
    }

    let userName = localStorage.getItem("userName");
    if (!userName) {
      userName = `Bidder-${userId.slice(-4)}`;
      localStorage.setItem("userName", userName);
    }

    return { userId, userName };
  }, []);

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

  // Initialize socket connection
  useEffect(() => {
    if (!lotId) return;

    // Initialize socket server
    fetch("/api/socketio").catch(console.error);

    // Create socket connection
    socketRef.current = io(
      process.env.NODE_ENV === "production"
        ? undefined
        : "http://localhost:3000",
      {
        transports: ["websocket", "polling"],
      }
    );

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("joinLot", String(lotId));
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    // Handle bid updates
    socket.on("bidUpdate", (data) => {
      console.log("Received bid update:", data);
      setBidError("");
      setIsPlacingBid(false);

      const newBid = {
        id: data.bid?.id || Date.now(),
        amount: data.currentBid || data.bid?.amount,
        user: data.bid?.user || "Anonymous",
        time: new Date().toISOString(),
        isOwn: data.bid?.userId === getUserInfo().userId,
      };

      setBids((prev) => [newBid, ...prev]);
      setCurrentBid(data.currentBid);
      setTotalBids((prev) =>
        data.totalBids !== undefined ? data.totalBids : prev + 1
      );
    });

    // Handle bid rejection
    socket.on("bidRejected", (data) => {
      console.log("Bid rejected:", data);
      setBidError(data.reason || "Bid was rejected");
      setIsPlacingBid(false);
      if (data.currentBid !== undefined) {
        setCurrentBid(data.currentBid);
      }
    });

    // Handle initial lot data from server
    socket.on("lotData", (data) => {
      console.log("Received lot data:", data);
      if (data.bids) {
        setBids(data.bids.reverse()); // Show newest first
      }
      if (data.currentBid !== undefined) {
        setCurrentBid(data.currentBid);
      }
      if (data.totalBids !== undefined) {
        setTotalBids(data.totalBids);
      }
    });

    return () => {
      if (socket) {
        socket.emit("leaveLot", String(lotId));
        socket.disconnect();
      }
    };
  }, [lotId, getUserInfo]);

  // Fetch lot + auction data (initial)
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
        setCurrentBid(lot.currentBid || lot.startingBid || 0);
        setTotalBids(lot.totalBids || 0);

        if (lot.bids && Array.isArray(lot.bids)) {
          setBids(lot.bids.reverse());
        }

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

  // Auto scroll to top of bids when new bid arrives
  useEffect(() => {
    if (bidsContainerRef.current) {
      bidsContainerRef.current.scrollTop = 0;
    }
  }, [bids]);

  // Place Bid
  const placeBid = useCallback(() => {
    if (!lotData || !socketRef.current || isPlacingBid) return;

    const bidValue = parseFloat(bidAmount);
    const minBid = currentBid || lotData.startingBid || 0;

    if (!bidValue || isNaN(bidValue) || bidValue <= minBid) {
      setBidError(`Your bid must be higher than $${minBid}`);
      return;
    }

    setIsPlacingBid(true);
    setBidError("");

    const { userId, userName } = getUserInfo();

    socketRef.current.emit("placeBid", {
      lotId: String(lotData._id || lotId),
      amount: bidValue,
      user: userName,
      userId: userId,
    });

    setBidAmount("");
  }, [bidAmount, lotData, lotId, currentBid, isPlacingBid, getUserInfo]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      placeBid();
    }
  };

  const nextPhoto = () => {
    if (lotData?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === lotData.photos.length - 1 ? 0 : prev + 1
      );
    }
  };
  const prevPhoto = () => {
    if (lotData?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? lotData.photos.length - 1 : prev - 1
      );
    }
  };

  const formatBidTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const liveStream = auction?.liveStreamUrl;
  const isAuctionEnded = timeLeft === "Auction Ended";

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
          {liveStream ? (
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <video
                key={liveStream}
                src={liveStream}
                controls
                autoPlay
                muted
                className="w-full h-[400px] bg-black"
              />
            </div>
          ) : lotData.photos?.length > 0 ? (
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
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-[#335566]">
              {lotData.title}
            </h1>
            <span
              className={`text-xs px-2 py-1 rounded ${
                socketConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
              title={
                socketConnected ? "Live connection active" : "Connecting..."
              }
            >
              {socketConnected ? "LIVE" : "CONNECTING"}
            </span>
          </div>

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
                ${currentBid || lotData.startingBid}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Starting Bid: ${lotData.startingBid}
            </p>
            {totalBids > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Total Bids: {totalBids}
              </p>
            )}
            {auction && (
              <>
                <p className="text-sm text-gray-500 mt-1">
                  Auction: {auction.title}
                </p>
                <p
                  className={`mt-3 font-semibold ${
                    isAuctionEnded ? "text-red-500" : "text-green-600"
                  }`}
                >
                  Time Left: {timeLeft || "Loading..."}
                </p>
              </>
            )}
          </div>

          {/* Bid Input */}
          {!isAuctionEnded ? (
            <div className="mt-6">
              <div className="flex">
                <input
                  type="number"
                  placeholder="Enter your bid"
                  className="border text-black border-gray-300 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-[#6ED0CE]"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onKeyPress={handleKeyPress}
                  min={0}
                  step="0.01"
                  disabled={isPlacingBid}
                />
                <button
                  onClick={placeBid}
                  disabled={isPlacingBid}
                  className="bg-[#6ED0CE] px-8 py-3 rounded-r-lg font-semibold text-[#335566] hover:bg-[#4DB1B1] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingBid ? "Placing..." : "Place Bid"}
                </button>
              </div>
              {bidError && (
                <p className="mt-2 text-sm text-red-600">{bidError}</p>
              )}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#335566]">Live Bids</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-xs text-gray-500">
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {bids.length > 0 ? (
            <div
              ref={bidsContainerRef}
              className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
            >
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    bid.isOwn
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {bid.user}
                      {bid.isOwn && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatBidTime(bid.time)}
                    </p>
                  </div>
                  <p className="font-bold text-[#335566]">${bid.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bids yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
