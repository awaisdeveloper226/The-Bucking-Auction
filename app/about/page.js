// app/about/page.tsx  (Next.js App Router)
// or pages/about.tsx (Next.js Pages Router)

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5F8F7] text-gray-800">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-[#00AEB4] to-[#2A5670] text-white py-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            We connect buyers and sellers in an innovative online marketplace with a seamless experience and modern technology.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
            alt="Our Team"
            className="rounded-xl shadow-lg"
          />
          <div>
            <h2 className="text-3xl font-semibold text-[#0A0F2C] mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded with the mission to revolutionize the marketplace experience, our platform ensures fairness, transparency, and convenience.
              Whether you’re here to buy or sell, we’ve built tools and features to make it effortless for you.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We combine a customer-first approach with cutting-edge technology to create a safe, efficient, and enjoyable space for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 md:px-16 bg-[#F0FAFA]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-[#007A80] mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To empower individuals and businesses by providing a platform where buying and selling happens with trust, speed, and simplicity.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-[#1D4ED8] mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be the most user-friendly and secure online marketplace that connects people globally, removing barriers and building opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-[#0A0F2C] to-[#1D4ED8] text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Growing Community</h2>
        <p className="text-lg mb-6 opacity-90">
          Whether you’re a buyer, seller, or just curious, we’d love to have you onboard.
        </p>
        <a
          href="/signup"
          className="inline-block bg-[#00AEB4] hover:bg-[#007A80] text-white font-medium px-8 py-3 rounded-lg shadow-lg transition"
        >
          Get Started
        </a>
      </section>
    </main>
  );
}
