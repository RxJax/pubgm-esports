"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  playerIgn: string;
  playerId: string;
}

export default function Navbar({ isLoggedIn, playerIgn, playerId }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-[#0D0E12] border-b-2 border-gaming-gray relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl">🏆</span>
            <span className="font-black text-sm sm:text-base uppercase tracking-widest text-white group-hover:text-digital-yellow transition">
              PUBGM <span className="text-digital-yellow">Scout</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition"
            >
              Discovery Feed
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-black uppercase tracking-widest text-digital-yellow hover:text-amber-400 transition"
                >
                  🎮 Dashboard ({playerIgn})
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-black uppercase tracking-widest text-airdrop-red hover:text-red-500 transition cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-transparent hover:bg-digital-yellow/5 border-2 border-digital-yellow text-digital-yellow font-black text-xs px-4 py-2 rounded-xl uppercase tracking-widest transition shadow-md shadow-amber-950/15"
                >
                  Create Profile
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0E12] border-b border-gaming-gray px-4 pt-2 pb-4 flex flex-col gap-3.5 shadow-2xl animate-fade-in">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white py-1 transition"
          >
            Discovery Feed
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-digital-yellow hover:text-amber-400 py-1 transition"
              >
                🎮 Dashboard ({playerIgn})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs font-black uppercase tracking-widest text-airdrop-red hover:text-red-500 py-1 text-left transition cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white py-1 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-transparent border-2 border-digital-yellow text-digital-yellow font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-widest transition"
              >
                Create Profile
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
