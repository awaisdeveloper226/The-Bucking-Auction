// app/home/page.jsx
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2B3D46] to-[#4A6F7D] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            The Bucking Auction
          </h1>
          <p className="mt-5 text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
            Live Bidding • Reserve Prices • 100% Fair & Transparent Auctions
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/sale-ring"
              className="bg-[#6ED0CE] px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[#4DB1B1] hover:scale-105 transition transform"
            >
              View Live Auctions
            </Link>
            <Link
              href="/register"
              className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#335566] hover:scale-105 transition transform"
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
                  src={`data:image/jpeg;base64,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`}
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
                <p className="text-gray-700 mt-3 font-medium">Current Bid: $2,500</p>
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
            Reach verified buyers across the country and secure the best price for your livestock.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block bg-[#6ED0CE] px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[#4DB1B1] hover:scale-105 transition"
          >
            Become a Seller
          </Link>
        </div>
      </section>
    </div>
  );
}
