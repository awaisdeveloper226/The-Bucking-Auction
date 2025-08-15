// app/upcoming-auctions/page.jsx
import Image from "next/image";

export default function UpcomingAuctionsPage() {
  // Example upcoming auctions (will be dynamic from DB later)
  const upcomingAuctions = [
    {
      id: 1,
      title: "Carsen Perry Legacy Fund Auction",
      date: "September 12, 2025",
      time: "6:00 PM CST",
      flyer: "/images/banners/auction1.jpg",
      location: "Perry Ranch, Texas",
      description: "A special auction event supporting the Carsen Perry Legacy Fund. Featuring top-quality livestock from leading breeders."
    },
    {
      id: 2,
      title: "Fall Elite Bull Sale",
      date: "October 3, 2025",
      time: "5:00 PM CST",
      flyer: "/images/banners/auction2.jpg",
      location: "Lone Star Cattle Co., Oklahoma",
      description: "Elite selection of registered bulls ready for breeding programs."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#335566] text-white py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Upcoming Auctions</h1>
        <p className="mt-2 text-lg">Mark your calendar and get ready to bid</p>
      </section>

      {/* Auction List */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {upcomingAuctions.map((auction) => (
          <div
            key={auction.id}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            {/* Flyer */}
            <Image
              src={auction.flyer}
              alt={auction.title}
              width={800}
              height={500}
              className="w-full h-72 object-cover"
            />

            {/* Auction Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#335566]">{auction.title}</h2>
              <p className="text-gray-500 mt-1">
                {auction.date} — {auction.time}
              </p>
              <p className="text-gray-500 italic">{auction.location}</p>
              <p className="mt-4 text-gray-700">{auction.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
