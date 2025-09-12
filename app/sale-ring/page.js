"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SaleRingPage() {
  const [auction, setAuction] = useState(null);
  const [lots, setLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleCardClick = (lotId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/register"); // redirect if not logged in
    } else {
      router.push(`/sale-ring/${lotId}`); // go to lot page if logged in
    }
  };

  useEffect(() => {
    const fetchAuctionAndLots = async () => {
      try {
        // 1. Get published auction
        const auctionRes = await fetch("/api/auctions");
        const auctionData = await auctionRes.json();

        // Handle different response structures
        let auctions = [];
        if (auctionData.success && auctionData.auctions) {
          auctions = auctionData.auctions;
        } else if (Array.isArray(auctionData)) {
          auctions = auctionData;
        } else if (
          auctionData.auctions &&
          Array.isArray(auctionData.auctions)
        ) {
          auctions = auctionData.auctions;
        }

        const activeAuction = auctions.find((a) => a.status === "published");

        if (activeAuction) {
          setAuction(activeAuction);

          // 2. Get lots for this specific auction using auctionId query parameter
          const lotRes = await fetch(
            `/api/lots?auctionId=${activeAuction._id}`
          );
          const lotData = await lotRes.json();

          // Handle the response structure from your API
          let fetchedLots = [];
          if (Array.isArray(lotData)) {
            fetchedLots = lotData;
          } else if (lotData.lots && Array.isArray(lotData.lots)) {
            fetchedLots = lotData.lots;
          }

          // The API should already filter by auctionId, but let's ensure we only get lots for this auction
          const auctionLots = fetchedLots.filter(
            (lot) =>
              lot.auctionId === activeAuction._id ||
              lot.auctionId?._id === activeAuction._id
          );

          setLots(auctionLots);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionAndLots();
  }, []);

  const filteredLots = lots.filter((lot) =>
    lot.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Auction Header */}
      <section className="bg-[#335566] text-white py-8 text-center">
        {auction ? (
          <>
            <h1 className="text-4xl font-bold">{auction.title}</h1>
            <p className="mt-2 text-lg">{auction.description}</p>
            {auction.flyer && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={auction.flyer.replace(
                    "/upload/",
                    "/upload/f_auto,q_auto,w_600/"
                  )}
                  alt={auction.title}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
            )}
          </>
        ) : (
          <h1 className="text-3xl font-bold">No Active Auction</h1>
        )}
      </section>

      {/* Search */}
      {auction && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold text-[#335566] text-center mb-7 mt-7">
            Live Auction Lots – Place Your Bids Now!
          </h2>

          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search lots..."
              className="w-full max-w-lg border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ED0CE] text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-[#6ED0CE] hover:bg-[#4DB1B1] text-[#335566] px-4 py-2 rounded-r-lg font-semibold">
              Search
            </button>
          </div>
        </div>
      )}

      {/* Lots */}
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center">
            Loading lots...
          </p>
        ) : !auction ? (
          <p className="text-center text-gray-500 col-span-full mt-12">
            No active auction is live.
          </p>
        ) : filteredLots.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full mt-12">
            No matching lots found.
          </p>
        ) : (
          filteredLots.map((lot) => (
            <div
              key={lot._id}
              onClick={() => handleCardClick(lot._id)}
              className="cursor-pointer group block bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="relative">
                {lot.photos?.[0] && (
                  <Image
                    src={lot.photos[0].replace(
                      "/upload/",
                      "/upload/f_auto,q_auto,w_400/"
                    )}
                    alt={lot.title}
                    width={400}
                    height={280}
                    className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                )}
                <span
                  className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                    lot.status === "active"
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {lot.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-[#335566] group-hover:text-[#4DB1B1] transition-colors">
                  {lot.title}
                </h3>
                <p className="text-gray-700 mt-2">
                  Current Bid:{" "}
                  <span className="font-bold">
                    ${lot.currentBid || lot.startingBid}
                  </span>
                </p>
                <button className="mt-4 w-full bg-[#335566] hover:bg-[#4a6f7d] text-white py-2 rounded font-medium transition">
                  Bid Now!
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Auctions */}
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <Link
          href="/past-auctions"
          className="inline-block bg-[#6ED0CE] hover:bg-[#4DB1B1] text-[#335566] px-6 py-3 rounded font-semibold transition"
        >
          View Past Auctions
        </Link>
      </div>
    </div>
  );
}
