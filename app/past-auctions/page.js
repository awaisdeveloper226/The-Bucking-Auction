// app/past-auctions/page.jsx
import Image from "next/image";
import Link from "next/link";
import { connectToDB } from "@/lib/mongodb";
import Auction from "@/models/Auction";

export const dynamic = "force-dynamic"; // ensures fresh data each time

export default async function PastAuctionsPage() {
  await connectToDB();

  // Fetch only archived auctions
  const pastAuctions = await Auction.find({ status: "archived" }).lean();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#335566] text-white py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Past Auctions</h1>
        <p className="mt-2 text-lg">
          Browse our auction history and view results
        </p>
      </section>

      {/* Past Auction List */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {pastAuctions.length > 0 ? (
          pastAuctions.map((auction) => (
            <div
              key={auction._id.toString()}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* Flyer */}
              {auction.flyer && (
                <Image
                  src={auction.flyer}
                  alt={auction.title}
                  width={800}
                  height={500}
                  className="w-full h-72 object-contain"
                />
              )}

              {/* Auction Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#335566]">
                  {auction.title}
                </h2>
                <p className="text-gray-500 mt-1">{auction.date}</p>
                {auction.location && (
                  <p className="text-gray-500 italic">{auction.location}</p>
                )}
                <p className="mt-4 text-gray-700">{auction.description}</p>

                {/* Results Link */}
                {auction.resultsLink && (
                  <Link
                    href={auction.resultsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-[#335566] text-white px-4 py-2 rounded hover:bg-[#224455] transition"
                  >
                    View Results
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-2">
            No past auctions found.
          </p>
        )}
      </div>
    </div>
  );
}
