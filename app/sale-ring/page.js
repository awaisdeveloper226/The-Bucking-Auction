// app/sale-ring/page.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SaleRingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const lots = [
    { id: 1, title: "Lot 1 – Premium Angus Bull", bid: 2500, status: "Live", img: "/images/lot1.jpg" },
    { id: 2, title: "Lot 2 – Champion Heifer", bid: 1800, status: "Live", img: "/images/lot2.jpg" },
    { id: 3, title: "Lot 3 – Registered Hereford Bull", bid: 3000, status: "Live", img: "/images/lot3.jpg" },
    { id: 4, title: "Lot 4 – Purebred Charolais", bid: 2200, status: "Live", img: "/images/lot4.jpg" },
  ];

  const filteredLots = lots.filter((lot) =>
    lot.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#335566] text-white py-8 text-center">
        <h1 className="text-4xl font-bold">Sale Ring</h1>
        <p className="mt-2 text-lg">Current active live lots — click to view details</p>
      </section>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search by lot title or number..."
            className="w-full max-w-lg border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6ED0CE] text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-[#6ED0CE] hover:bg-[#4DB1B1] text-[#335566] px-4 py-2 rounded-r-lg font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Active Lots Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <Link key={lot.id} href={`/sale-ring/${lot.id}`} className="group block bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            <div className="relative">
              <Image
                src={lot.img}
                alt={lot.title}
                width={400}
                height={280}
                className="w-full h-48 object-contain group-hover:scale-105 transition-transform"
              />
              <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${lot.status === 'Live' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {lot.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-[#335566] group-hover:text-[#4DB1B1] transition-colors">
                {lot.title}
              </h3>
              <p className="text-gray-700 mt-2">
                Current Bid: <span className="font-bold">${lot.bid}</span>
              </p>
              <button
                className="mt-4 w-full bg-[#335566] hover:bg-[#4a6f7d] text-white py-2 rounded font-medium transition"
              >
                View Lot
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredLots.length === 0 && (
        <p className="text-center text-gray-500 mt-12">No matching lots found.</p>
      )}

      {/* Past Auctions Link */}
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
