// app/components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // prettier mobile icons

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/sale-ring", label: "Sale Ring" },
    { href: "/upcoming-auctions", label: "Upcoming Auctions" },
    { href: "/past-auctions", label: "Past Auctions" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
  ];

  return (
    <nav className="bg-[#2b3a4a] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo + Name */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/favicon.png"
                alt="The Bucking Auction"
                width={45}
                height={45}
                className="rounded-full"
              />
              <span className="font-bold text-xl tracking-wide hover:text-[#6ED0CE] transition-colors">
                The Bucking Auction
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#6ED0CE] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              className="bg-[#6ED0CE] text-[#2b3a4a] px-4 py-2 rounded-lg font-medium hover:bg-[#4DB1B1] transition-colors"
            >
              Get Bidder Number
            </Link>
            <Link
              href="/login"
              className="hover:text-[#6ED0CE] transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#2b3a4a] px-4 pb-4 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 border-b border-gray-700 hover:text-[#6ED0CE] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="block py-2 border-b border-gray-700 bg-[#6ED0CE] text-[#2b3a4a] rounded-lg text-center font-medium hover:bg-[#4DB1B1] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Get Bidder Number
          </Link>
          <Link
            href="/login"
            className="block py-2 hover:text-[#6ED0CE] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
