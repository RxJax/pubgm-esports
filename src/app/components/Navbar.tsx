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
          {/* Left: Branding & Candidate Feed Link next to it */}
          <div className="flex items-center gap-4">
            <Link href="/" className="relative flex items-center h-16 px-6 bg-gradient-to-b from-[#1c1f26] to-[#0A0D14] border-x-2 border-b-2 border-[#FFBD03]/50 rounded-b-2xl shadow-lg shadow-black/80 group">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFBD03] to-transparent" />
              <span className="text-lg mr-2 filter drop-shadow-[0_0_3px_rgba(255,189,3,0.5)]">🏆</span>
              <span className="font-black text-sm uppercase tracking-widest text-white group-hover:text-digital-yellow transition">
                PUBGM <span className="text-digital-yellow">SCOUT</span>
              </span>
            </Link>

            <Link
              href="/?tab=pool"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gaming-gray hover:border-[#FFBD03]/30 bg-gaming-black/40 text-[10px] font-black text-gray-300 hover:text-white uppercase tracking-widest transition"
            >
              🔍 Candidate Feed
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition"
            >
              DISCOVERY FEED
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-black uppercase tracking-widest text-[#a855f7] hover:text-digital-yellow transition"
                >
                  🎮 PROFILE
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-black uppercase tracking-widest text-[#ef4444] hover:text-red-500 transition cursor-pointer"
                >
                  LOG OUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/register"
                  className="bg-transparent hover:bg-digital-yellow/5 border-2 border-digital-yellow text-digital-yellow font-black text-xs px-4 py-2 rounded-xl uppercase tracking-widest transition shadow-md shadow-amber-950/15"
                >
                  CREATE PROFILE
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
        <div className="md:hidden bg-[#0D0E12]/95 backdrop-blur-md border-b-2 border-gaming-gray px-6 py-3 flex flex-col gap-1.5 shadow-2xl animate-fade-in">
          <Link
            href="/?tab=pool"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-black uppercase tracking-widest text-digital-yellow hover:text-amber-400 min-h-[48px] flex items-center border-b border-gaming-gray/30 transition gap-2"
          >
            🔍 Candidate Feed
          </Link>
          <Link
            href="/?tab=overview"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white min-h-[48px] flex items-center border-b border-gaming-gray/30 transition"
          >
            Discovery Feed
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-digital-yellow hover:text-amber-400 min-h-[48px] flex items-center border-b border-gaming-gray/30 transition"
              >
                🎮 PROFILE
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs font-black uppercase tracking-widest text-airdrop-red hover:text-red-500 min-h-[48px] flex items-center py-1 text-left transition cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white min-h-[48px] flex items-center border-b border-gaming-gray/30 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-transparent border-2 border-digital-yellow text-digital-yellow font-black text-xs min-h-[48px] flex items-center justify-center rounded-xl uppercase tracking-widest transition mt-2"
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
