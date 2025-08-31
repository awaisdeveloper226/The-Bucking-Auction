// app/components/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#335566] text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <p className="text-sm text-gray-300 text-center md:text-left">
          &copy; {new Date().getFullYear()} Buckers Auction. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-sm">
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
