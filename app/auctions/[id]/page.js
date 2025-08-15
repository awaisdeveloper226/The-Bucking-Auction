// app/auctions/[id]/page.jsx
import Image from "next/image";
import Link from "next/link";

// Simulated auction data (replace with DB/API later)
const auctions = [
  {
    id: "spring-ranch",
    title: "Spring Ranch Dispersal",
    date: "March 15, 2025",
    flyer: "/images/banners/past1.jpg",
    location: "Hilltop Ranch, Kansas",
    description:
      "A complete dispersal of Hilltop Ranch’s cattle herd, with outstanding results for breeders and buyers alike. This sale offered a range of premium cattle, each carefully bred for performance and longevity.",
    videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
    gallery: [
      "/images/gallery/img1.jpg",
      "/images/gallery/img2.jpg",
      "/images/gallery/img3.jpg",
    ],
    resultsLink: "/pdfs/spring-ranch-results.pdf",
  },
];

export default function AuctionDetails({ params }) {
  const auction = auctions.find((a) => a.id === params.id);

  if (!auction) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Auction not found</h1>
        <Link href="/upcoming-auctions" className="text-blue-500 underline">
          Back to Auctions
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#335566] text-white py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">{auction.title}</h1>
        <p className="mt-2 text-lg">{auction.date} — {auction.location}</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Flyer Image */}
        <div>
          <Image
            src={auction.flyer}
            alt={auction.title}
            width={800}
            height={500}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Auction Info */}
        <div>
          <h2 className="text-2xl font-semibold text-[#335566] mb-4">
            Auction Details
          </h2>
          <p className="text-gray-700 leading-relaxed">{auction.description}</p>

          {auction.resultsLink && (
            <a
              href={auction.resultsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 bg-[#335566] text-white px-5 py-2 rounded hover:bg-[#224455] transition"
            >
              View Results PDF
            </a>
          )}
        </div>
      </div>

      {/* Video Section */}
      {auction.videoUrl && (
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-semibold text-[#335566] mb-4">
            Auction Video
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={auction.videoUrl}
              title="Auction Video"
              allowFullScreen
              className="w-full h-96 rounded-lg shadow-lg"
            ></iframe>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {auction.gallery.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-semibold text-[#335566] mb-4">
            Photo Gallery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {auction.gallery.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`Gallery image ${i + 1}`}
                width={400}
                height={300}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="text-center mt-12 pb-10">
        <Link
          href="/upcoming-auctions"
          className="text-blue-600 hover:underline"
        >
          ← Back to Auctions
        </Link>
      </div>
    </div>
  );
}
