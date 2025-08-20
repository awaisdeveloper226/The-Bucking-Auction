// app/services/page.tsx
import Link from "next/link";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#335566] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            At The Bucking Auction, we provide a seamless platform for buyers and sellers to connect through live auctions.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-10">
        
        {/* Service Card 1 */}
        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-[#6ED0CE] hover:shadow-2xl transition duration-300">
          <h2 className="text-xl font-semibold mb-4">Live Auctions</h2>
          <p className="text-gray-600">
            Experience the excitement of real-time bidding with live updates and a smooth user interface for buyers and sellers.
          </p>
        </div>

        

        {/* Service Card 3 */}
        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-[#6ED0CE] hover:shadow-2xl transition duration-300">
          <h2 className="text-xl font-semibold mb-4">Buyer Dashboard</h2>
          <p className="text-gray-600">
            Track auctions you’re interested in, place bids instantly, and manage your bidder number in one place.
          </p>
        </div>

      </section>

      {/* Call to Action */}
      <section className="bg-[#6ED0CE] py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Join the Auction?</h2>
        <Link href="/register" className="inline-block bg-[#335566] text-white px-6 py-3 rounded-lg hover:bg-[#223a48] transition">
          Get Your Bidder Number
        </Link>
      </section>
    </main>
  );
}
