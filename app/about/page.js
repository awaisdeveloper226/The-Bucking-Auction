// app/about/page.tsx
"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F5F8F7] text-gray-800">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-[#00AEB4] to-[#2A5670] text-white py-24 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg animate-fadeIn">
            About Us
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto animate-fadeIn delay-200">
            At <span className="font-semibold">The Bucking Auction</span>, we connect buyers and sellers with our unique marketing techniques, supporting the <span className="font-semibold">bucking bull industry</span> while valuing every participant – the breeder, the buyer, the competitor, the partner, and the fan.
          </p>
        </div>

        
      </section>

      {/* Our Story */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
            alt="Our Team"
            className="rounded-xl shadow-md hover:scale-105 transition-transform duration-500"
          />
          <div>
            <h2 className="text-3xl font-semibold text-[#0A0F2C] mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In 2025, Phil Markoff and Tenneile Rice of <Link href="https://trcattle.com" className="text-[#00AEB4] underline">TR Cattle</Link> offered their yearling crop to the public for the first time. They spent countless hours preparing each calf for its future, ensuring every detail was perfect.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Phil believed Tenneile could market the cattle herself on Facebook, but Tenneile wanted a professional touch. After consulting their trusted friend Sonny Barthold, who endorsed the idea, Tenneile took the challenge and launched a highly successful auction, marketing every calf with precision.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Beyond auctions, Tenneile works closely with the Carsen Perry Legacy Fund, running an annual benefit auction with Sonny to honor and sustain the legacy. As demand grew, it became clear a larger, more robust platform was needed – and thus, The Bucking Auction was born.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-[#F0FAFA] rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <h3 className="text-2xl font-semibold text-[#007A80] mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To connect the <span className="font-semibold">best bulls and rodeo cows</span> with the best owners—people who will give them the opportunity to become champions or produce champions.
            </p>
          </div>
          <div className="bg-[#F0FAFA] rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <h3 className="text-2xl font-semibold text-[#1D4ED8] mb-3">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              Bucking bulls and rodeo cows are more than just animals; they’re family. We strive to place them in safe, loving environments where they can thrive and grow into champions. <span className="font-semibold">The Bucking Auction is more than an auction—it’s a legacy in the making and your gateway to the next champion.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-r from-[#0A0F2C] to-[#1D4ED8] text-white text-center rounded-t-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Growing Community</h2>
        <p className="text-lg mb-6 opacity-90">
          We would love to have you onboard.
        </p>
        <Link
          href="/register"
          className="inline-block bg-[#00AEB4] hover:bg-[#007A80] text-white font-medium px-10 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
