"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  playerIgn: string;
  playerId: string;
  isAdmin?: boolean;
}

export default function Navbar({ isLoggedIn, playerIgn, playerId, isAdmin }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Sync state with URL search parameters
  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);

    const cleanVal = val.trim();
    // If it's a numeric character ID (typically 5 to 15 digits), check if we can redirect immediately
    if (/^\d{5,15}$/.test(cleanVal)) {
      fetch(`/api/players?search=${encodeURIComponent(cleanVal)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const match = data.find((p: any) => p.characterId === cleanVal);
          if (match) {
            router.push(`/players/${match.id}`);
            if (showMobileSearch) setShowMobileSearch(false);
            setMobileMenuOpen(false);
          }
        })
        .catch((err) => console.error("Error matching character ID:", err));
    }

    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }

    if (pathname !== "/") {
      router.push(`/?${params.toString()}`);
    } else {
      router.replace(`/?${params.toString()}`);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = searchVal.trim();
      if (!val) return;

      try {
        const res = await fetch(`/api/players?search=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          // Find exact match (case-insensitive for IGN, or exact for characterId)
          const exactMatch = data.find((p: any) =>
            p.ign.toLowerCase() === val.toLowerCase() ||
            p.characterId === val
          );
          if (exactMatch) {
            router.push(`/players/${exactMatch.id}`);
            if (showMobileSearch) setShowMobileSearch(false);
            setMobileMenuOpen(false);
          }
        }
      } catch (err) {
        console.error("Search redirect matching error:", err);
      }
    }
  };

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
          {/* Left: Branding, Search Input & Candidate Feed Link */}
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <Link href="/" className="relative flex items-center h-16 px-6 bg-gradient-to-b from-[#1c1f26] to-[#0A0D14] border-x-2 border-b-2 border-[#FFBD03]/50 rounded-b-2xl shadow-lg shadow-black/80 group shrink-0">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFBD03] to-transparent" />
              <span className="text-lg mr-2 filter drop-shadow-[0_0_3px_rgba(255,189,3,0.5)]">🏆</span>
              <span className="font-black text-sm uppercase tracking-widest text-white group-hover:text-digital-yellow transition">
                PUBGM <span className="text-digital-yellow">SCOUT</span>
              </span>
            </Link>

            {/* Cyberpunk Search Field (Desktop/Tablet) */}
            <div className="hidden md:block relative max-w-[240px] lg:max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search IGN or Character ID..."
                value={searchVal}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#0b0c10]/70 backdrop-blur-md border border-gaming-gray hover:border-[#FFBD03]/30 focus:border-[#FFBD03] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none transition shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)] focus:shadow-[0_0_10px_rgba(255,189,3,0.1)]"
              />
            </div>

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
                {isAdmin && (
                  <Link
                    href="/admin/moderation"
                    className="text-[10px] font-black uppercase tracking-widest text-[#FFBD03] hover:text-white border border-[#FFBD03]/30 hover:border-[#FFBD03] bg-[#FFBD03]/5 px-3 py-1.5 rounded-xl transition shadow-[0_0_8px_rgba(255,189,3,0.15)] hover:shadow-[0_0_12px_rgba(255,189,3,0.35)] shrink-0"
                  >
                    🛠️ ADMIN PANEL
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-xs font-black uppercase tracking-widest text-[#a855f7] hover:text-digital-yellow transition"
                >
                  🎮 PROFILE
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition cursor-pointer"
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

          {/* Mobile Actions: Search toggle & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Search Toggle Button */}
            <button
              onClick={() => {
                setShowMobileSearch(!showMobileSearch);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg transition ${
                showMobileSearch ? "text-[#FFBD03] bg-gaming-gray/20" : "text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Menu Toggle Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (showMobileSearch) setShowMobileSearch(false);
              }}
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

      {/* Mobile Search Bar Expansion */}
      {showMobileSearch && (
        <div className="md:hidden bg-[#0D0E12]/95 backdrop-blur-md border-b-2 border-gaming-gray p-4 flex flex-col gap-1.5 shadow-2xl animate-fade-in">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search IGN or Character ID..."
              value={searchVal}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0b0c10]/80 border border-gaming-gray focus:border-[#FFBD03] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none transition placeholder-gray-500"
              autoFocus
            />
          </div>
        </div>
      )}

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
              {isAdmin && (
                <Link
                  href="/admin/moderation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-[#FFBD03] hover:text-white min-h-[48px] flex items-center gap-2 border-b border-gaming-gray/30 transition"
                >
                  🛠️ ADMIN PANEL
                </Link>
              )}
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
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 min-h-[48px] flex items-center py-1 text-left transition cursor-pointer"
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
