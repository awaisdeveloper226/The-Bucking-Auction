// app/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    accountHref: "/account",
  });
  const pathname = usePathname();
  const bcRef = useRef(null);

  const computeAuth = () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userId = localStorage.getItem(USER_ID_KEY);

      const isLoggedIn = !!(token || userId);
      const accountHref = userId ? `/dashboard/${userId}` : "/account";

      setAuth({ isLoggedIn, accountHref });
    } catch {
      setAuth({ isLoggedIn: false, accountHref: "/account" });
    }
  };

  useEffect(() => {
    computeAuth();
    setHydrated(true);

    // BroadcastChannel for robust cross-tab sync
    try {
      bcRef.current = new BroadcastChannel("auth");
      bcRef.current.onmessage = computeAuth;
    } catch {
      bcRef.current = null;
    }

    // Storage (other tabs)
    const onStorage = (e) => {
      if ([TOKEN_KEY, USER_ID_KEY].includes(e.key)) computeAuth();
    };
    window.addEventListener("storage", onStorage);

    // Custom in-tab event
    const onAuthChange = () => computeAuth();
    window.addEventListener("authChange", onAuthChange);

    // Focus/visibility = cheap safety net
    const onFocus = () => computeAuth();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    // Patch localStorage once so same-tab set/remove triggers updates automatically
    if (!window.__authPatched__) {
      window.__authPatched__ = true;
      const _setItem = localStorage.setItem.bind(localStorage);
      const _removeItem = localStorage.removeItem.bind(localStorage);

      localStorage.setItem = (key, value) => {
        const res = _setItem(key, value);
        if ([TOKEN_KEY, USER_ID_KEY].includes(key)) {
          try {
            window.dispatchEvent(new Event("authChange"));
          } catch {}
          try {
            bcRef.current?.postMessage({ type: "changed" });
          } catch {}
        }
        return res;
      };

      localStorage.removeItem = (key) => {
        const res = _removeItem(key);
        if ([TOKEN_KEY, USER_ID_KEY].includes(key)) {
          try {
            window.dispatchEvent(new Event("authChange"));
          } catch {}
          try {
            bcRef.current?.postMessage({ type: "changed" });
          } catch {}
        }
        return res;
      };
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      try {
        bcRef.current?.close();
      } catch {}
    };
  }, []);

  // Re-check on route change (covers router.replace after login)
  useEffect(() => {
    computeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);

      // Patched localStorage will auto-fire updates
    } catch {}
    setIsOpen(false);
  };

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
            alt="Buckers Auction"
            width={45}
            height={45}
            className="rounded-full"
          />
          <span className="font-bold text-xl tracking-wide hover:text-[#6ED0CE] transition-colors">
            Buckers Auction
          </span>
        </Link>
      </div>

      {/* Desktop Menu (lg only) */}
      <div className="hidden lg:flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-[#6ED0CE] transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {hydrated &&
          (auth.isLoggedIn ? (
            <Link href={auth.accountHref} className="block py-2" onClick={() => setIsOpen(false)}>
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#6ED0CE]">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-[#6ED0CE] text-[#2b3a4a] px-4 py-2 rounded-lg font-medium hover:bg-[#4DB1B1] transition-colors"
              >
                Get Bidder Number
              </Link>
              <Link href="/login" className="hover:text-[#6ED0CE] transition-colors">
                Login
              </Link>
            </>
          ))}
      </div>

      {/* Mobile & Tablet Menu Button */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </div>
  </div>

  {/* Mobile & Tablet Dropdown */}
  {isOpen && (
    <div className="lg:hidden bg-[#2b3a4a] px-4 pb-4 space-y-2 animate-fadeIn">
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

      {hydrated &&
        (auth.isLoggedIn ? (
          <Link href={auth.accountHref} className="block py-2" onClick={() => setIsOpen(false)}>
            <div className="flex">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#6ED0CE]">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Link>
        ) : (
          <>
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
          </>
        ))}
    </div>
  )}
</nav>

  );
}
