// app/home/page.jsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [auction, setAuction] = useState(null);
  const [lots, setLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2B3D46] to-[#4A6F7D] text-white overflow-hidden">
        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Decorative shapes */}
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 bg-[#6ED0CE]/20 rounded-full blur-3xl mix-blend-soft-light"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#4DB1B1]/20 rounded-full blur-2xl mix-blend-soft-light"></div>

        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg animate-fadeIn">
            Buckers Auction
          </h1>
          {/* Tagline */}
          <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-[#CFE8E6] italic font-semibold animate-fadeIn delay-200">
            More than an auction, a legacy in the making, your gateway to the
            next champion
          </p>
          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-gray-200 animate-fadeIn delay-400">
            Live Bidding • Reserve Prices • 100% Fair & Transparent Auctions
          </p>
          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-5 justify-center animate-fadeIn delay-600">
            <Link
              href="/sale-ring"
              className="bg-[#6ED0CE] px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:bg-[#4DB1B1] hover:scale-105 transition transform text-lg"
            >
              View Live Auctions
            </Link>
            <Link
              href={userId ? `/dashboard/${userId}` : "/register"}
              className="border border-white px-10 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#335566] hover:scale-105 transition transform text-lg"
            >
              {userId ? "My Dashboard" : "Get Bidder Number"}
            </Link>
          </div>
        </div>
      </section>

      {/* Search */}
      {auction && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold text-[#335566] text-center mb-7 mt-7">
            Live Lots – Bid in Real Time
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
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          filteredLots.map((lot) => {
            const handleCardClick = () => {
              const storedUserId = localStorage.getItem("userId");
              if (!storedUserId) {
                router.push("/register");
              } else {
                router.push(`/sale-ring/${lot._id}`);
              }
            };

            return (
              <div
                key={lot._id}
                onClick={handleCardClick}
                className="group block bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent bubbling to card
                      handleCardClick();
                    }}
                    className="mt-4 w-full bg-[#335566] hover:bg-[#4a6f7d] text-white py-2 rounded font-medium transition"
                  >
                    Bid Now!
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
