"use client";

import React, { useState, useEffect, useMemo, useRef, memo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  tag: string;
  logoUrl: string | null;
  region: string;
}

interface Player {
  id: string;
  ign: string;
  characterId: string;
  region: string;
  bio: string;
  status: string;
  avatarUrl?: string | null;
  role: string;
  device: string;
  controlSetup: string;
  kdRatio: number;
  headshotPct: number;
  winRate: number;
  matchesPlayed: number;
  urRank: string;
  urPoints: number;
  team: Team | null;
  isFeatured?: boolean;
  isVerified?: boolean;
  teamHistory?: string | null;
  achievements?: string | null;
  highestTier?: string;
  profileType?: string;
  coachingYears?: number;
  coachingHistory?: string | null;
  specialties?: string | null;
  underContract?: boolean;
  contractStartDate?: Date | string | null;
  contractEndDate?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface DiscoveryClientProps {
  initialPlayers: Player[];
  initialRising?: Player[];
  initialTier2?: Player[];
  initialRisingStars?: Player[];
  initialFeatured?: Player[];
  initialError?: boolean;
  loggedInPlayerId?: string | null;
}

const ROLES = ["All", "IGL", "Entry Fragger", "Fragger", "Assaulter", "Support", "Sniper", "Scout", "Coach"];
const REGIONS = ["All", "Southeast Asia", "South Asia", "Europe", "North America", "Middle East"];
const STATUSES = ["All", "Signed", "Looking For Team"];
const UR_RANKS = ["All", "Vanguard", "Exceed", "Supreme", "Peerless", "Legend"];

const isUserActive = (updatedAt?: Date | string | null) => {
  if (!updatedAt) return false;
  const date = new Date(updatedAt);
  const diffMins = (Date.now() - date.getTime()) / (1000 * 60);
  return diffMins < 5; // Active if updated/accessed in last 5 minutes
};

const getRelativeTime = (updatedAt?: Date | string | null) => {
  if (!updatedAt) return "Long ago";
  const date = new Date(updatedAt);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getContractDurationText = (player: Player) => {
  if (!player.contractStartDate || !player.contractEndDate) return "";
  try {
    const options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
    const start = new Date(player.contractStartDate).toLocaleDateString("en-US", options);
    const end = new Date(player.contractEndDate).toLocaleDateString("en-US", options);
    return `Contract: ${start} – ${end}`;
  } catch (e) {
    return "";
  }
};

const getEsportsRating = (tier?: string | null) => {
  if (tier === "S-Tier") return 150;
  if (tier === "A-Tier") return 110;
  if (tier === "B-Tier") return 70;
  if (tier === "C-Tier") return 35;
  return 0;
};

const PlayerCarouselCard = memo(({ player }: { player: Player }) => {
  const borderGlowClass = 
    player.urRank === "Legend" ? "border-[#FFBD03] hover:shadow-[0_0_15px_rgba(255,189,3,0.3)] shadow-black/80" :
    player.urRank === "Peerless" ? "border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] shadow-black/80" :
    player.urRank === "Supreme" ? "border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] shadow-black/80" :
    "border-gaming-gray hover:border-digital-yellow/40";

  return (
    <Link
      href={`/players/${player.id}`}
      className={`group flex-none w-[85vw] sm:w-[340px] snap-center snap-always bg-gradient-to-br from-gaming-gray/30 to-[#0c0d12] hover:from-gaming-gray/50 hover:to-[#0c0d12] border-2 rounded-2xl p-5 hover:scale-[1.01] hover:border-yellow-400 transition-all duration-300 relative overflow-hidden shadow-lg ${borderGlowClass}`}
    >
      <div className="flex gap-3 mb-2 relative">
        <div className="w-12 h-15 rounded-lg bg-gaming-black border border-gaming-gray overflow-hidden shrink-0 relative flex items-center justify-center">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} className="w-full h-full object-cover animate-fade-in" alt="" />
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-500 bg-gradient-to-t from-[#15161c] to-[#252836]">
              <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
              <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <h3 className="font-extrabold text-white text-base group-hover:text-digital-yellow transition uppercase tracking-wide flex items-center gap-1.5 text-left justify-start">
              <span>{player.ign}</span>
              {(player.isVerified || player.isFeatured) && (
                <span className="relative group/tooltip inline-flex items-center shrink-0 align-middle cursor-pointer" tabIndex={0}>
                  <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-[#1877F2] text-white select-none pointer-events-auto shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 112, 243, 0.7))' }}>
                    <svg className="w-[9.5px] h-[9.5px] text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white bg-black border border-gaming-gray rounded-lg opacity-0 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 shadow-xl font-sans normal-case">
                    Verified Pro
                  </span>
                </span>
              )}
            </h3>
            <div className="text-[9px] font-black bg-airdrop-red/10 text-airdrop-red border border-airdrop-red/20 px-2 py-0.5 rounded shrink-0 self-center">
              {player.urRank === "Legend" ? "Tier-1 Pro" : player.urRank === "Peerless" ? "Tier-2 Pro" : player.urRank === "Supreme" ? "Tier-3 Pro" : player.urRank === "Exceed" ? "Semi-Pro" : "Amateur"}
            </div>
          </div>
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider text-left">
            {player.status === "Signed" ? (player.team?.name || "Not Available") : (player.team?.name || "Free Agent")}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-block text-[8px] bg-digital-yellow/15 text-digital-yellow border border-digital-yellow/20 px-2 py-0.5 rounded font-black uppercase">
              🎯 {player.role}
            </span>
            {player.status !== "Looking For Team" && player.status !== "Free Agent" && player.underContract && player.contractStartDate && player.contractEndDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-airdrop-red/30 bg-airdrop-red/10 text-[8px] font-black text-airdrop-red uppercase tracking-wider animate-pulse">
                🔒 {getContractDurationText(player)}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs italic mb-2 line-clamp-1 mt-1 text-left">
        &ldquo;{player.bio}&rdquo;
      </p>

      {/* Chart and Heatmap block */}
      <div className="flex gap-3 mt-3 border-t border-gaming-gray/30 pt-3">
        <div>
          <span className="text-[8px] text-gray-500 font-bold block uppercase text-left">Recent Tourney</span>
          <div className="flex items-center gap-1.5 mt-1">
            <svg width="65" height="24" className="text-digital-yellow">
              <path d="M0,20 L15,12 L30,18 L45,5 L60,10" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="60" cy="10" r="2" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div className="border-l border-gaming-gray/30 pl-3">
          <span className="text-[8px] text-gray-500 font-bold block uppercase text-left">Heat Map</span>
          <div className="grid grid-cols-5 gap-[1px] mt-1.5 w-12 h-6 bg-gaming-black/60 p-[1px] rounded border border-gaming-gray/30">
            {Array.from({ length: 10 }).map((_, idx) => {
              const opacity = [0.1, 0.4, 0.8, 0.2, 0.9, 0.3, 0.7, 0.5, 0.9, 0.2][(idx + Math.round(player.kdRatio)) % 10];
              return (
                <div
                  key={idx}
                  className="rounded-[2px]"
                  style={{
                    backgroundColor: `rgba(255, 189, 3, ${opacity})`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-gaming-gray/40 flex items-center justify-between">
        <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">Live Recruitment Status</span>
        {player.status === "Looking For Team" || player.status === "Free Agent" ? (
          <span className="text-[9px] font-black bg-[#10B981] text-white px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm shadow-[#10B981]/20">
            OPEN FOR OFFERS
          </span>
        ) : (
          <span className="text-[9px] font-black bg-airdrop-red/10 text-airdrop-red border border-airdrop-red/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            NOT AVAILABLE
          </span>
        )}
      </div>
    </Link>
  );
});
PlayerCarouselCard.displayName = "PlayerCarouselCard";

const CandidateRow = memo(({ player }: { player: Player }) => {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex flex-col sm:grid sm:grid-cols-5 gap-3.5 sm:gap-4 items-start sm:items-center px-5 py-4 bg-[#0d0e12] hover:bg-[#15161c] border border-gaming-gray/60 hover:border-digital-yellow/30 rounded-2xl transition duration-150 shadow-md w-full"
    >
      {/* PROFILE column */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-9 h-9 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0 relative">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
              <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
              <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
            </svg>
          )}
        </div>
        <div className="truncate text-left">
          <div className="flex items-center gap-1.5 justify-start">
            <span className="truncate">{player.ign}</span>
            {(player.isVerified || player.isFeatured) && (
              <span className="relative group/tooltip inline-flex items-center shrink-0 align-middle cursor-pointer" tabIndex={0}>
                <span className="inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#1877F2] text-white select-none pointer-events-auto shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 112, 243, 0.7))' }}>
                  <svg className="w-[8.5px] h-[8.5px] text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white bg-black border border-gaming-gray rounded-lg opacity-0 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 shadow-xl font-sans normal-case">
                  Verified Pro
                </span>
              </span>
            )}
          </div>
          <p className="text-[9px] text-gray-500 uppercase truncate">
            {player.status === "Signed" ? (player.team?.name || "Not Available") : (player.team?.name || "Free Agent")}
          </p>
          {player.status !== "Looking For Team" && player.status !== "Free Agent" && player.underContract && player.contractStartDate && player.contractEndDate && (
            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-airdrop-red/30 bg-airdrop-red/10 text-[7px] font-bold text-airdrop-red uppercase tracking-wider block w-fit">
              🔒 {getContractDurationText(player)}
            </div>
          )}
        </div>
      </div>

      {/* ROLE column */}
      <div className="text-xs font-semibold text-gray-300 flex items-center gap-2 w-full sm:w-auto text-left">
        <span className="text-gray-500 text-[9px] uppercase font-black tracking-wider sm:hidden w-16 shrink-0">Role:</span>
        <div className="flex items-center gap-1.5 justify-start">
          <span className="text-digital-yellow text-xs">🎯</span>
          <span>{player.profileType === "Coach" ? "PRO COACH" : player.role}</span>
        </div>
      </div>

      {/* FILTER TAGS column */}
      <div className="flex items-center sm:block gap-2 w-full sm:w-auto text-left">
        <span className="text-gray-500 text-[9px] uppercase font-black tracking-wider sm:hidden w-16 shrink-0">Tags:</span>
        <div className="flex flex-wrap gap-1.5 justify-start">
          <span className="bg-gaming-gray/40 text-gray-400 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
            {player.region}
          </span>
          {player.profileType === "Coach" ? (
            <span className="bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
              👑 {player.coachingYears} Years Exp
            </span>
          ) : (
            <span className="bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">
              {player.urRank === "Legend" ? "Tier-1 Pro" : player.urRank === "Peerless" ? "Tier-2 Pro" : player.urRank === "Supreme" ? "Tier-3 Pro" : player.urRank === "Exceed" ? "Semi-Pro" : "Amateur"}
            </span>
          )}
        </div>
      </div>

      {/* SORT / STATS column */}
      <div className="flex items-center sm:block gap-2 w-full sm:w-auto text-left">
        <span className="text-gray-500 text-[9px] uppercase font-black tracking-wider sm:hidden w-16 shrink-0">Standing:</span>
        {player.profileType === "Coach" ? (
          <div className="flex flex-col text-[10px] font-bold text-gray-400 font-mono text-left">
            <div>Type: <span className="text-digital-yellow font-black">Coach</span></div>
            <div className="text-[8px] text-gray-500 truncate max-w-[120px]">{player.specialties || "Generalist"}</div>
          </div>
        ) : (
          <div className="flex flex-col text-[10px] font-bold text-gray-400 font-mono text-left">
            <div>Rating: <span className="text-airdrop-red font-black">{getEsportsRating(player.highestTier)}</span></div>
            <div className="text-[8px] text-gray-500">Tier: {player.highestTier || "None"}</div>
          </div>
        )}
      </div>

      {/* SORTED / ACTIVE column */}
      <div className="flex items-center sm:items-end justify-start sm:justify-center sm:text-right text-[10px] text-gray-500 font-mono gap-2 w-full border-t border-gaming-gray/30 pt-3 sm:border-0 sm:pt-0">
        <span className="text-gray-500 text-[9px] uppercase font-black tracking-wider sm:hidden w-16 shrink-0">Status:</span>
        <div className="flex flex-col sm:items-end text-left sm:text-right">
          {isUserActive(player.updatedAt) ? (
            <>
              <span className="text-green-500 font-black">Active now</span>
              <span className="text-[8px] text-gray-600">Online</span>
            </>
          ) : (
            <>
              <span className="text-red-500 font-black">Inactive</span>
              <span className="text-[8px] text-gray-600">Last active: {getRelativeTime(player.updatedAt)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
});
CandidateRow.displayName = "CandidateRow";

export default function DiscoveryClient({
  initialPlayers,
  initialRising = [],
  initialTier2 = [],
  initialRisingStars = [],
  initialFeatured = [],
  initialError = false,
  loggedInPlayerId = null,
}: DiscoveryClientProps) {
  // Return elegant full-screen empty database state if no players exist and no user is logged in
  if (initialError) {
    return (
      <div className="flex-1 bg-gaming-black text-gray-100 min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
        {/* Cyber grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        
        <div className="relative z-10 max-w-lg flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gaming-gray border-2 border-airdrop-red/30 text-airdrop-red flex items-center justify-center text-4xl shadow-lg animate-pulse">
            ⚠️
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-airdrop-red via-digital-yellow to-airdrop-red bg-clip-text text-transparent">
            System Maintenance
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md">
            We're having trouble reaching the scouting records. Please refresh or try again in a moment.
          </p>
          <div className="mt-4 p-3 bg-airdrop-red/10 border border-airdrop-red/30 rounded-xl text-[10px] text-airdrop-red font-bold uppercase tracking-wider">
            🔒 Connection Status: Offline / Unreachable
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gaming-gray/80 hover:bg-gaming-gray text-digital-yellow border border-digital-yellow/30 font-bold px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Return elegant full-screen empty database state if no players exist and no user is logged in
  if (initialPlayers.length === 0 && !loggedInPlayerId) {
    return (
      <div className="flex-1 bg-gaming-black text-gray-100 min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
        {/* Cyber grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        
        <div className="relative z-10 max-w-lg flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gaming-gray border-2 border-digital-yellow/30 text-digital-yellow flex items-center justify-center text-4xl shadow-lg">
            🏆
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-airdrop-red via-digital-yellow to-airdrop-red bg-clip-text text-transparent">
            PUBGM Discovery Hub
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md">
            No verified players found yet. Be the first to build your player card and get noticed by scouts globally!
          </p>
          <Link
            href="/register"
            className="mt-2 bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition shadow-lg shadow-amber-950/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Build Your Player Card
          </Link>
        </div>
      </div>
    );
  }

  // Real-time backend query states
  const [allPlayersCache, setAllPlayersCache] = useState<Player[]>(initialPlayers);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllPlayersCache(initialPlayers);
  }, [initialPlayers]);
  
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearch(urlSearch);

    // Auto-scroll to search feed on mobile/tablet viewports if requested
    const tab = searchParams.get("tab");
    if (tab === "pool" && window.innerWidth < 1280) {
      setTimeout(() => {
        feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [deviceType, setDeviceType] = useState("All"); // All, tablet, phone
  const [gyro, setGyro] = useState("All"); // All, on, off
  const [selectedUrRank, setSelectedUrRank] = useState("All");

  // Mobile layout states
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // In-Memory search & filter execution
  useEffect(() => {
    let filtered = [...allPlayersCache];

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (p) => p.ign.toLowerCase().includes(s) || p.characterId.includes(s)
      );
    }

    if (selectedRole && selectedRole !== "All") {
      if (selectedRole === "Coach") {
        filtered = filtered.filter((p) => p.profileType === "Coach");
      } else {
        filtered = filtered.filter((p) => p.role === selectedRole && p.profileType !== "Coach");
      }
    }

    if (selectedRegion && selectedRegion !== "All") {
      filtered = filtered.filter((p) => p.region === selectedRegion);
    }

    if (selectedStatus && selectedStatus !== "All") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    if (selectedUrRank && selectedUrRank !== "All") {
      filtered = filtered.filter((p) => p.urRank === selectedUrRank);
    }

    if (minRating > 0) {
      const allowedTiers = ["S-Tier"];
      if (minRating <= 110) allowedTiers.push("A-Tier");
      if (minRating <= 70) allowedTiers.push("B-Tier");
      if (minRating <= 35) allowedTiers.push("C-Tier");
      filtered = filtered.filter((p) => allowedTiers.includes(p.highestTier || ""));
    }

    if (deviceType === "tablet") {
      filtered = filtered.filter(
        (p) =>
          p.device?.toLowerCase().includes("ipad") ||
          p.device?.toLowerCase().includes("tablet")
      );
    } else if (deviceType === "phone") {
      filtered = filtered.filter(
        (p) =>
          !(
            p.device?.toLowerCase().includes("ipad") ||
            p.device?.toLowerCase().includes("tablet")
          )
      );
    }

    if (gyro === "on") {
      filtered = filtered.filter((p) => p.controlSetup?.toLowerCase().includes("gyro"));
    } else if (gyro === "off") {
      filtered = filtered.filter((p) => !p.controlSetup?.toLowerCase().includes("gyro"));
    }

    setPlayers(filtered);
  }, [allPlayersCache, debouncedSearch, selectedRole, selectedRegion, selectedStatus, minRating, deviceType, gyro, selectedUrRank]);

  // Curated lists from live database queries
  const topRisingFraggers = useMemo(() => initialRising.filter(p => p.urRank === "Legend"), [initialRising]);
  const topTier2Fraggers = useMemo(() => initialTier2.filter(p => p.urRank === "Peerless"), [initialTier2]);
  const risingStarPlayers = useMemo(() => initialRisingStars.filter(p => ["Supreme", "Exceed", "Vanguard"].includes(p.urRank)), [initialRisingStars]);
  const featuredProfiles = initialFeatured;

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (selectedRole !== "All") count++;
    if (selectedRegion !== "All") count++;
    if (selectedStatus !== "All") count++;
    if (minRating > 0) count++;
    if (deviceType !== "All") count++;
    if (gyro !== "All") count++;
    if (selectedUrRank !== "All") count++;
    return count;
  }, [search, selectedRole, selectedRegion, selectedStatus, minRating, deviceType, gyro, selectedUrRank]);

  return (
    <div className="flex-1 w-full bg-gaming-black text-gray-100 min-h-screen pb-20 px-4 md:px-8">
      {/* Discovery Hub Banner */}
      <header className={`relative py-8 px-6 bg-gradient-to-r from-[#0d0e12] to-[#151720] border border-gaming-gray rounded-3xl mb-8 max-w-7xl mx-auto md:items-center md:justify-between gap-4 overflow-hidden ${activeTab === "pool" ? "hidden xl:flex" : "flex flex-col md:flex-row"}`}>
        {/* Background Trophies SVG */}
        <div className="absolute right-24 bottom-0 hidden md:block">
          <svg width="320" height="160" viewBox="0 0 400 200" fill="none">
            <style>
              {`
                @keyframes goldPulse {
                  0%, 100% {
                    opacity: 0.25;
                    filter: drop-shadow(0 0 2px rgba(255, 189, 3, 0.15)) brightness(1.0);
                  }
                  50% {
                    opacity: 0.50;
                    filter: drop-shadow(0 0 16px rgba(255, 189, 3, 0.6)) brightness(1.2);
                  }
                }
                @keyframes silverPulse {
                  0%, 100% {
                    opacity: 0.20;
                    filter: drop-shadow(0 0 1px rgba(186, 195, 214, 0.1)) brightness(1.0);
                  }
                  50% {
                    opacity: 0.40;
                    filter: drop-shadow(0 0 10px rgba(186, 195, 214, 0.4)) brightness(1.15);
                  }
                }
                @keyframes bronzePulse {
                  0%, 100% {
                    opacity: 0.15;
                    filter: drop-shadow(0 0 1px rgba(217, 138, 72, 0.1)) brightness(1.0);
                  }
                  50% {
                    opacity: 0.35;
                    filter: drop-shadow(0 0 8px rgba(217, 138, 72, 0.35)) brightness(1.1);
                  }
                }
                .gold-trophy-group {
                  animation: goldPulse 4s infinite ease-in-out;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  cursor: pointer;
                  pointer-events: auto;
                }
                .silver-trophy-group {
                  animation: silverPulse 5s infinite ease-in-out;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  cursor: pointer;
                  pointer-events: auto;
                }
                .bronze-trophy-group {
                  animation: bronzePulse 6s infinite ease-in-out;
                  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                  cursor: pointer;
                  pointer-events: auto;
                }
                .gold-trophy-group:hover {
                  animation: none;
                  opacity: 1.0 !important;
                  filter: drop-shadow(0 0 25px rgba(255, 189, 3, 0.95)) brightness(1.4) !important;
                  transform: scale(1.06);
                  transform-origin: 200px 190px;
                }
                .silver-trophy-group:hover {
                  animation: none;
                  opacity: 0.90 !important;
                  filter: drop-shadow(0 0 18px rgba(186, 195, 214, 0.85)) brightness(1.3) !important;
                  transform: scale(1.06);
                  transform-origin: 100px 190px;
                }
                .bronze-trophy-group:hover {
                  animation: none;
                  opacity: 0.85 !important;
                  filter: drop-shadow(0 0 14px rgba(217, 138, 72, 0.75)) brightness(1.2) !important;
                  transform: scale(1.06);
                  transform-origin: 300px 190px;
                }
              `}
            </style>
            <defs>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C68A0C" />
                <stop offset="35%" stopColor="#FFBD03" />
                <stop offset="65%" stopColor="#FFF3D1" />
                <stop offset="100%" stopColor="#A06900" />
              </linearGradient>
              <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6C7289" />
                <stop offset="35%" stopColor="#BAC3D6" />
                <stop offset="65%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#474B59" />
              </linearGradient>
              <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8A4A16" />
                <stop offset="35%" stopColor="#D98A48" />
                <stop offset="65%" stopColor="#FAD3B2" />
                <stop offset="100%" stopColor="#663309" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Silver Trophy (2nd place) */}
            <g className="silver-trophy-group">
              {/* Base */}
              <rect x="70" y="180" width="60" height="10" rx="2" fill="url(#silver)" fillOpacity="0.1" stroke="url(#silver)" strokeWidth="1.5" />
              <rect x="80" y="172" width="40" height="8" rx="1" fill="url(#silver)" fillOpacity="0.1" stroke="url(#silver)" strokeWidth="1.5" />
              {/* Stem */}
              <path d="M95,140 L95,172 L105,172 L105,140 Z" fill="url(#silver)" fillOpacity="0.15" stroke="url(#silver)" strokeWidth="1.5" />
              {/* Cup Bowl */}
              <path d="M75,70 C75,115 88,140 100,140 C112,140 125,115 125,70 Z" fill="url(#silver)" fillOpacity="0.1" stroke="url(#silver)" strokeWidth="2" />
              <ellipse cx="100" cy="70" rx="25" ry="4" fill="url(#silver)" fillOpacity="0.25" stroke="url(#silver)" strokeWidth="1.5" />
              {/* Handles */}
              <path d="M75,82 C56,82 56,118 75,118" fill="none" stroke="url(#silver)" strokeWidth="1.5" />
              <path d="M125,82 C144,82 144,118 125,118" fill="none" stroke="url(#silver)" strokeWidth="1.5" />
            </g>

            {/* Center Gold Trophy (1st place) */}
            <g className="gold-trophy-group">
              {/* Base */}
              <rect x="155" y="178" width="90" height="12" rx="3" fill="url(#gold)" fillOpacity="0.15" stroke="url(#gold)" strokeWidth="2.5" filter="url(#glow)" />
              <rect x="172" y="166" width="56" height="12" rx="2" fill="url(#gold)" fillOpacity="0.15" stroke="url(#gold)" strokeWidth="2" />
              {/* Stem */}
              <path d="M191,125 L191,166 L209,166 L209,125 Z" fill="url(#gold)" fillOpacity="0.2" stroke="url(#gold)" strokeWidth="2" />
              <rect x="186" y="140" width="28" height="5" rx="1" fill="url(#gold)" fillOpacity="0.3" stroke="url(#gold)" strokeWidth="1.5" />
              {/* Cup Bowl */}
              <path d="M165,45 C165,100 182,125 200,125 C218,125 235,100 235,45 Z" fill="url(#gold)" fillOpacity="0.12" stroke="url(#gold)" strokeWidth="3" />
              <ellipse cx="200" cy="45" rx="35" ry="6" fill="url(#gold)" fillOpacity="0.3" stroke="url(#gold)" strokeWidth="2.5" />
              {/* Handles */}
              <path d="M165,60 C138,60 138,105 165,105" fill="none" stroke="url(#gold)" strokeWidth="2.5" />
              <path d="M235,60 C262,60 262,105 235,105" fill="none" stroke="url(#gold)" strokeWidth="2.5" />
              {/* Star Icon */}
              <path d="M200,70 L203,77 L211,78 L205,83 L207,91 L200,87 L193,91 L195,83 L189,78 L197,77 Z" fill="url(#gold)" fillOpacity="0.6" stroke="url(#gold)" strokeWidth="1" />
            </g>

            {/* Right Bronze Trophy (3rd place) */}
            <g className="bronze-trophy-group">
              {/* Base */}
              <rect x="275" y="180" width="50" height="10" rx="2" fill="url(#bronze)" fillOpacity="0.1" stroke="url(#bronze)" strokeWidth="1.5" />
              <rect x="285" y="174" width="30" height="6" rx="1" fill="url(#bronze)" fillOpacity="0.1" stroke="url(#bronze)" strokeWidth="1.5" />
              {/* Stem */}
              <path d="M296,148 L296,174 L304,174 L304,148 Z" fill="url(#bronze)" fillOpacity="0.15" stroke="url(#bronze)" strokeWidth="1.5" />
              {/* Cup Bowl */}
              <path d="M280,85 C280,122 290,148 300,148 C310,148 320,122 320,85 Z" fill="url(#bronze)" fillOpacity="0.08" stroke="url(#bronze)" strokeWidth="2" />
              <ellipse cx="300" cy="85" rx="20" ry="3" fill="url(#bronze)" fillOpacity="0.2" stroke="url(#bronze)" strokeWidth="1.5" />
              {/* Handles */}
              <path d="M280,95 C263,95 263,127 280,127" fill="none" stroke="url(#bronze)" strokeWidth="1.5" />
              <path d="M320,95 C337,95 337,127 320,127" fill="none" stroke="url(#bronze)" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black tracking-wider bg-gradient-to-r from-airdrop-red to-digital-yellow bg-clip-text text-transparent uppercase mt-2">
            PRO ESPORTS RECRUITMENT PORTAL
          </h1>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Professional competitive database tracking PUBG Mobile esports talent, achievements, and team histories.
          </p>
        </div>
        
      </header>

      <main className="max-w-7xl mx-auto w-full flex flex-col gap-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full">
          {/* LEFT COLUMN: Prospects & Featured Rosters */}
          <div className={`xl:col-span-5 flex flex-col gap-8 w-full ${activeTab === "pool" ? "hidden xl:flex" : "flex"}`}>
            {/* ================= SECTION 1: TIER-1 PROSPECTS ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider text-airdrop-red flex items-center gap-2">
              <span className="text-xl">🔥</span> TIER-1 PROSPECTS
            </h2>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider hidden sm:inline">COMPETITIVE EXPERIENCE &ge; SEMI-PRO</span>
          </div>

          <div className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-5 shadow-[0_0_20px_rgba(255,189,3,0.02)]">
            <div className="flex overflow-x-auto pb-2 gap-5 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gaming-gray scrollbar-track-transparent w-full">
            {topRisingFraggers.length === 0 ? (
              <div className="w-full bg-[#111827]/10 border border-gaming-gray rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No other verified competitors have registered yet. Share the portal link to start recruiting!
                </p>
              </div>
            ) : (
              topRisingFraggers.map((player) => (
                <PlayerCarouselCard key={player.id} player={player} />
              ))
            )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 1.5: TIER-2 PROSPECTS ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span className="text-xl">⚡</span> TIER-2 PROSPECTS
            </h2>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider hidden sm:inline">COMPETITIVE EXPERIENCE &ge; TIER-2</span>
          </div>

          <div className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-5 shadow-[0_0_20px_rgba(255,189,3,0.02)]">
            <div className="flex overflow-x-auto pb-2 gap-5 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gaming-gray scrollbar-track-transparent w-full">
            {topTier2Fraggers.length === 0 ? (
              <div className="w-full bg-[#111827]/10 border border-gaming-gray rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">⚡</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No Tier-2 verified competitors have registered yet.
                </p>
              </div>
            ) : (
              topTier2Fraggers.map((player) => (
                <PlayerCarouselCard key={player.id} player={player} />
              ))
            )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 1.75: RISING STARS ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider text-green-400 flex items-center gap-2">
              <span className="text-xl">✨</span> RISING STAR
            </h2>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider hidden sm:inline">COMPETITIVE EXPERIENCE &ge; AMATEUR</span>
          </div>

          <div className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-5 shadow-[0_0_20px_rgba(255,189,3,0.02)]">
            <div className="flex overflow-x-auto pb-2 gap-5 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gaming-gray scrollbar-track-transparent w-full">
            {risingStarPlayers.length === 0 ? (
              <div className="w-full bg-[#111827]/10 border border-gaming-gray rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">✨</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No rising stars have registered yet.
                </p>
              </div>
            ) : (
              risingStarPlayers.map((player) => (
                <PlayerCarouselCard key={player.id} player={player} />
              ))
            )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: FEATURED ESPORTS ROSTERS ================= */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-digital-yellow flex items-center gap-2">
            <span className="text-xl">⭐</span> FEATURED ESPORTS ROSTERS
          </h2>
          
          <div className="bg-[#0d0e12] border-2 border-dashed border-gaming-gray/60 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-digital-yellow/[0.01] rounded-full blur-xl" />
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,189,3,0.3)]">🔒</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              FEATURED ROSTERS LOCKED
            </h3>
            <p className="text-gray-400 text-xs max-w-md leading-relaxed">
              Only system developers can add and configure official competitive esports rosters. 
              Please contact the platform administrator to register team slots.
            </p>
          </div>
        </section>
          </div>

          {/* RIGHT COLUMN: Candidate Pool Feed */}
          <div
            ref={feedRef}
            className={`xl:col-span-7 flex flex-col gap-4 w-full ${activeTab === "overview" ? "hidden xl:flex" : "flex"} ${activeTab === "pool" ? "border-0 pt-0" : "border-t xl:border-t-0 border-gaming-gray pt-8 xl:pt-0"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-airdrop-red flex items-center gap-2">
                <span className="text-lg">🔍</span> CANDIDATE POOL FEED
              </h2>
            </div>

            {/* Premium Cyberpunk Table Container */}
            <div className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-5 flex flex-col gap-4 shadow-[0_0_20px_rgba(255,189,3,0.02)] min-h-[500px]">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-wider px-1">
                <div>
                  FEED RESULTS:{" "}
                  <span className="text-digital-yellow font-black">
                    {loading ? "..." : players.length} PLAYER(S)
                  </span>
                </div>
                {loading ? (
                  <div className="text-digital-yellow animate-pulse">Filtering DB...</div>
                ) : (
                  <div>SORTED BY: RECENTLY UPDATED</div>
                )}
              </div>

              {/* Table body wrapper for internal scrolling */}
              <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-gaming-gray scrollbar-track-transparent">
                {players.length === 0 ? (
                <div className="bg-[#111827]/10 border border-gaming-gray rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                  <svg className="w-12 h-12 text-gaming-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-black text-gray-300 uppercase tracking-wider">
                    {activeFiltersCount > 0 ? "No Candidates Match" : "Feed Empty"}
                  </h3>
                  <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                    {activeFiltersCount > 0 
                      ? "Try broadening your filters or resetting query options."
                      : "No other verified competitors have registered yet. Share the portal link to start recruiting!"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gaming-gray/30">
                    <div>Profile</div>
                    <div>Role</div>
                    <div>Filter Tags</div>
                    <div>Sort / Stats</div>
                    <div className="text-right">Sorted / Active</div>
                  </div>

                  {/* Table Rows */}
                  {players.map((player) => (
                    <CandidateRow key={player.id} player={player} />
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
