// app/home/page.jsx
"use client";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
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
            The Bucking Auction
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
              href="/register"
              className="border border-white px-10 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#335566] hover:scale-105 transition transform text-lg"
            >
              Get Bidder Number
            </Link>
          </div>
        </div>

       
      </section>

      {/* Featured Auctions */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-[#335566] mb-12 text-center">
          Featured Lots
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((lot) => (
            <div
              key={lot}
              className="border rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 bg-white group"
            >
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={`/images/lot${lot}.jpg`}
                  alt={`Lot ${lot}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#6ED0CE] text-white px-3 py-1 text-sm font-semibold rounded-full shadow">
                  Lot #{lot}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-[#335566] group-hover:text-[#4DB1B1] transition">
                  Premium Angus Bull
                </h3>
                <p className="text-gray-700 mt-3 font-medium">
                  Current Bid: $2,500
                </p>
                <p className="text-sm text-gray-500">Ends in: 02:15:45</p>
                <Link
                  href={`/sale-ring/${lot}`}
                  className="block mt-5 bg-[#335566] text-white py-2 rounded-lg hover:bg-[#4a6f7d] hover:scale-105 transition text-center font-medium"
                >
                  Bid Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA */}
      <section className="bg-[#f3f8f8] py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#335566]">
            Sell with The Bucking Auction
          </h2>
          <p className="mt-4 text-gray-600">
            Reach verified buyers across the country and secure the best price
            for your livestock.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block bg-[#6ED0CE] px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[#4DB1B1] hover:scale-105 transition"
          >
            Become a Seller
          </Link>
        </div>
      </section>
    </div>
  );
}
