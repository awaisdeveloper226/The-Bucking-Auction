"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function LotDetailsPage() {
  const { lotId } = useParams();

  // ----- States -----
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
  const [currentUser, setCurrentUser] = useState(null); // ✅ user info
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // ----- Refs -----
  const socketRef = useRef(null);
  const bidsContainerRef = useRef(null);

  // ----- Get user info -----
  const getUserInfo = useCallback(async () => {
    try {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) return null;

      const res = await fetch(`/api/users/${storedUserId}`);
      if (!res.ok) return null;

      const user = await res.json();
      return {
        userId: user._id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        biddingNumber: user.biddingNumber || "N/A",
      };
    } catch (err) {
      console.error("Error fetching user info", err);
      return null;
    }
  }, []);

  useEffect(() => {
    getUserInfo().then(setCurrentUser);
  }, [getUserInfo]);

  // ----- Helpers -----
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

  // ----- Socket.io -----
  useEffect(() => {
    if (!lotId || !currentUser) return;

    fetch("/api/socketio").catch(console.error);

    socketRef.current = io(
      process.env.NODE_ENV === "production"
        ? undefined
        : "http://localhost:3000",
      { transports: ["websocket", "polling"] }
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

    socket.on("bidUpdate", (data) => {
      setBidError("");
      setIsPlacingBid(false);

      const bidUser = data.bid?.userId || {};
      const newBid = {
        id: data.bid?._id || Date.now(),
        amount: data.bid?.amount,
        biddingNumber: bidUser.biddingNumber || "N/A",
        name: bidUser.userName || "Anonymous",
        time: data.bid?.createdAt || new Date().toISOString(),
        isOwn: currentUser && bidUser._id === currentUser.userId,
      };

      setBids((prev) => [newBid, ...prev]);
      setCurrentBid(data.currentBid);
      setTotalBids((prev) =>
        data.totalBids !== undefined ? data.totalBids : prev + 1
      );
    });

    socket.on("bidRejected", (data) => {
      setBidError(data.reason || "Bid was rejected");
      setIsPlacingBid(false);
      if (data.currentBid !== undefined) setCurrentBid(data.currentBid);
    });

    socket.on("lotData", (data) => {
      if (data.bids) {
        const formattedBids = data.bids.map((b) => ({
          id: b._id,
          amount: b.amount,
          biddingNumber: b.userId?.biddingNumber || "N/A",
          name: b.userId?.userName || "Anonymous",
          time: b.createdAt || b.timestamp,
          isOwn: currentUser && b.userId?._id === currentUser.userId,
        }));
        setBids(formattedBids.reverse());
      }

      if (data.currentBid !== undefined) setCurrentBid(data.currentBid);
      if (data.totalBids !== undefined) setTotalBids(data.totalBids);
    });

    return () => {
      if (socket) {
        socket.emit("leaveLot", String(lotId));
        socket.disconnect();
      }
    };
  }, [lotId, currentUser]);

  // ----- Fetch Lot & Auction -----
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
          const formatted = lot.bids.map((b) => ({
            id: b._id,
            amount: b.amount,
            biddingNumber: b.userId?.biddingNumber || "N/A",
            name: b.userId
              ? `${b.userId.firstName || ""} ${b.userId.lastName || ""}`.trim()
              : "Anonymous",
            time: b.createdAt || b.timestamp,
            isOwn: currentUser && b.userId?._id === currentUser.userId,
          }));
          setBids(formatted.reverse());
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
  }, [lotId, currentUser]);

  // ----- Countdown Timer -----
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

  // ----- Auto scroll bids -----
  useEffect(() => {
    if (bidsContainerRef.current) {
      bidsContainerRef.current.scrollTop = 0;
    }
  }, [bids]);

  // ----- Place Bid -----
  const placeBid = useCallback(() => {
    if (!lotData || !socketRef.current || isPlacingBid || !currentUser) return;

    const bidValue = parseFloat(bidAmount);
    const minBid = currentBid || lotData.startingBid || 0;

    if (!bidValue || isNaN(bidValue) || bidValue <= minBid) {
      setBidError(`Your bid must be higher than $${minBid}`);
      return;
    }

    setIsPlacingBid(true);
    setBidError("");

    socketRef.current.emit("placeBid", {
      lotId: String(lotData._id || lotId),
      amount: bidValue,
      userId: currentUser.userId,
      userName: currentUser.userName,
      biddingNumber: currentUser.biddingNumber,
    });

    fetch(`/api/lots/${lotData._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bid: { userId: currentUser.userId, amount: bidValue },
      }),
    }).catch((err) => console.error("Error saving bid:", err));

    setBidAmount("");
  }, [bidAmount, lotData, lotId, currentBid, isPlacingBid, currentUser]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") placeBid();
  };

  // ----- Photo Carousel -----
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
    if (!timeString) return "";
    const date = new Date(timeString);
    return isNaN(date)
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const nextVideo = () => {
    if (lotData?.videos?.length > 0) {
      setCurrentVideoIndex((prev) =>
        prev === lotData.videos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevVideo = () => {
    if (lotData?.videos?.length > 0) {
      setCurrentVideoIndex((prev) =>
        prev === 0 ? lotData.videos.length - 1 : prev - 1
      );
    }
  };

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
        {/* Left: Media Carousel */}
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
          ) : lotData.photos?.length > 0 || lotData.videos?.length > 0 ? (
            <div className="relative mb-6">
              {/* Display Photos */}
              {lotData.photos?.length > 0 && (
                <>
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
                        className="absolute left-4 top-52 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-4 top-52 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                      >
                        ›
                      </button>
                     
                    </>
                  )}
                </>
              )}

              {/* Display Videos */}
              {lotData.videos?.length > 0 && (
                <div className="mt-4">
                  <video
                    key={currentVideoIndex}
                    src={lotData.videos[currentVideoIndex]}
                    controls
                    className="w-full h-[400px] rounded-xl shadow-lg object-cover"
                  />
                  {lotData.videos.length > 1 && (
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={prevVideo}
                        className="bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-70  "
                      >
                        ‹ Prev
                      </button>
                      
                      <button
                        onClick={nextVideo}
                        className="bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-70"
                      >
                        Next ›
                      </button>
                    </div>
                  )}
                </div>
              )}

              <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
                {lotData.status || "Active"}
              </span>
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

          {/* Pedigree & Details */}
          <div className="mt-4 space-y-2">
            {lotData.abbi && (
              <p className="text-gray-700">
                <strong>ABBI:</strong> {lotData.abbi}
              </p>
            )}
            {lotData.sire && (
              <p className="text-gray-700">
                <strong>SIRE:</strong> {lotData.sire}
              </p>
            )}
            {lotData.dam && (
              <p className="text-gray-700">
                <strong>DAM:</strong> {lotData.dam}
              </p>
            )}
            {lotData.age && (
              <p className="text-gray-700">
                <strong>Age:</strong> {lotData.age} years
              </p>
            )}
          </div>

          {/* Description */}
          {lotData.description && (
            <div className="mt-4 max-h-48 overflow-y-auto overflow-x-hidden p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                {lotData.description}
              </p>
            </div>
          )}

          {/* Seller Info */}
          <div className="mt-6 bg-[#f8fdfd] border border-[#e0f2f2] rounded-xl p-5 shadow-sm space-y-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Seller Information
            </h3>
            {lotData.sellerName && (
              <p>
                <strong>Name:</strong> {lotData.sellerName}
              </p>
            )}
            {lotData.sellerMobile && (
              <p>
                <strong>Mobile:</strong> {lotData.sellerMobile}
              </p>
            )}
            {lotData.sellerEmail && (
              <p>
                <strong>Email:</strong> {lotData.sellerEmail}
              </p>
            )}
          </div>

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
            <div className="mt-6 flex gap-3">
              <input
                type="number"
                placeholder="Enter your bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#335566]"
              />
              <button
                onClick={placeBid}
                disabled={isPlacingBid}
                className="bg-[#335566] text-white px-5 py-2 rounded-lg shadow hover:bg-[#223344] disabled:opacity-50"
              >
                {isPlacingBid ? "Placing..." : "Place Bid"}
              </button>
            </div>
          ) : (
            <p className="mt-6 text-red-500 font-semibold">
              Auction has ended. Bidding closed.
            </p>
          )}

          {bidError && <p className="mt-2 text-sm text-red-500">{bidError}</p>}

          {/* Bid History */}
          <div
            ref={bidsContainerRef}
            className="mt-8 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Bid History
            </h2>
            {bids.length === 0 ? (
              <p className="text-gray-500 text-sm">No bids yet.</p>
            ) : (
              <ul className="space-y-3">
                {bids.map((bid) => (
                  <li
                    key={bid.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      bid.isOwn
                        ? "bg-green-50 border border-green-200"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {bid.biddingNumber} – {bid.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBidTime(bid.time)}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-[#335566]">
                      ${bid.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}