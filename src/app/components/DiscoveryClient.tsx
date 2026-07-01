"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

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
  teamHistory?: string | null;
  achievements?: string | null;
}

interface DiscoveryClientProps {
  initialPlayers: Player[];
  initialRising?: Player[];
  initialFeatured?: Player[];
  initialError?: boolean;
  loggedInPlayerId?: string | null;
}

const ROLES = ["All", "IGL", "Entry Fragger", "Support", "Sniper"];
const REGIONS = ["All", "Southeast Asia", "South Asia", "Europe", "North America", "Middle East"];
const STATUSES = ["All", "Signed", "Looking For Team"];
const UR_RANKS = ["All", "Vanguard", "Exceed", "Supreme", "Peerless", "Legend"];

export default function DiscoveryClient({
  initialPlayers,
  initialRising = [],
  initialFeatured = [],
  initialError = false,
  loggedInPlayerId = null,
}: DiscoveryClientProps) {
  // Return elegant full-screen empty database state if no players exist and no user is logged in
  if (initialPlayers.length === 0 && !loggedInPlayerId) {
    return (
      <div className="flex-1 bg-gaming-black text-gray-100 min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
        {/* Cyber grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        
        <div className="relative z-10 max-w-lg flex flex-col items-center gap-6">
          <div className={`w-20 h-20 rounded-3xl bg-gaming-gray border-2 ${initialError ? "border-airdrop-red/30 text-airdrop-red" : "border-digital-yellow/30 text-digital-yellow"} flex items-center justify-center text-4xl shadow-lg`}>
            {initialError ? "⚠️" : "🏆"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-airdrop-red to-digital-yellow bg-clip-text text-transparent">
            {initialError ? "Database Unreachable" : "PUBGM Discovery Hub"}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
            {initialError ? (
              <>
                The live remote database is currently unreachable from your local network (requires IPv6).
                <br />
                <span className="text-[10px] text-gray-500 block mt-2 font-mono">
                  If testing locally, please see the <code className="text-digital-yellow font-bold">walkthrough.md</code> on how to copy a connection pooler URI from your Supabase dashboard.
                </span>
              </>
            ) : (
              "No verified players found yet. Be the first to build your Ultimate Royale card and get noticed by scouts globally!"
            )}
          </p>
          {!initialError && (
            <Link
              href="/register"
              className="mt-2 bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition shadow-lg shadow-amber-950/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Build Your Ultimate Royale Card
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Real-time backend query states
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [minKd, setMinKd] = useState(0);
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

  // Real-time API query fetcher
  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (debouncedSearch) queryParams.append("search", debouncedSearch);
        if (selectedRole && selectedRole !== "All") queryParams.append("role", selectedRole);
        if (selectedRegion && selectedRegion !== "All") queryParams.append("region", selectedRegion);
        if (selectedStatus && selectedStatus !== "All") queryParams.append("status", selectedStatus);
        if (minKd > 0) queryParams.append("minKd", minKd.toString());
        if (deviceType && deviceType !== "All") queryParams.append("deviceType", deviceType);
        if (gyro && gyro !== "All") queryParams.append("gyro", gyro);
        if (selectedUrRank && selectedUrRank !== "All") queryParams.append("urRank", selectedUrRank);

        const res = await fetch(`/api/players?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPlayers(data);
        }
      } catch (err) {
        console.error("Error fetching filtered players:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [debouncedSearch, selectedRole, selectedRegion, selectedStatus, minKd, deviceType, gyro, selectedUrRank]);

  // Curated lists from live database queries
  const topRisingFraggers = initialRising;
  const featuredProfiles = initialFeatured;

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (selectedRole !== "All") count++;
    if (selectedRegion !== "All") count++;
    if (selectedStatus !== "All") count++;
    if (minKd > 0) count++;
    if (deviceType !== "All") count++;
    if (gyro !== "All") count++;
    if (selectedUrRank !== "All") count++;
    return count;
  }, [search, selectedRole, selectedRegion, selectedStatus, minKd, deviceType, gyro, selectedUrRank]);

  return (
    <div className="flex-1 w-full bg-gaming-black text-gray-100 min-h-screen pb-20 px-4 md:px-8">
      {/* Discovery Hub Banner */}
      <header className="py-6 border-b border-gaming-gray mb-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2 py-0.5 rounded tracking-wider">
            Competitive Roster Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-wider bg-gradient-to-r from-airdrop-red to-digital-yellow bg-clip-text text-transparent uppercase mt-2">
            PRO ESPORTS RECRUITMENT PORTAL
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Professional competitive database tracking PUBG Mobile esports talent, achievements, and team histories.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-gaming-gray/30 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gaming-gray self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-300">
            {initialPlayers.length} Pro Portfolios Active
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* ================= SECTION 1: TIER-1 PROSPECTS ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider text-airdrop-red flex items-center gap-2">
              <span className="text-xl">🔥</span> TIER-1 PROSPECTS
            </h2>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider hidden sm:inline">Competitive Experience &ge; Semi-Pro</span>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-5 scrollbar-thin scrollbar-thumb-gaming-gray scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0 w-full">
            {topRisingFraggers.length === 0 ? (
              <div className="w-full bg-[#111827]/10 border border-gaming-gray rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No other verified competitors have registered yet. Share the portal link to start recruiting!
                </p>
              </div>
            ) : (
              topRisingFraggers.map((player) => (
                <Link
                  href={`/players/${player.id}`}
                  key={player.id}
                  className="group flex-none w-[280px] bg-gradient-to-br from-gaming-gray/30 to-[#0c0d12] hover:from-gaming-gray/50 hover:to-[#0c0d12] border border-gaming-gray rounded-2xl p-5 transition-all duration-300 relative overflow-hidden shadow-lg shadow-black/40"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gaming-black border border-gaming-gray flex items-center justify-center shrink-0">
                        {player.team?.logoUrl ? (
                          <img src={player.team.logoUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xs font-black text-gray-600">FA</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base group-hover:text-digital-yellow transition">
                          {player.ign}
                        </h3>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">
                          Role: <span className="text-digital-yellow">{player.role}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-[9px] font-black bg-airdrop-red/10 text-airdrop-red border border-airdrop-red/20 px-2 py-0.5 rounded">
                      {player.urRank === "Legend" ? "Tier-1 Pro" : player.urRank === "Peerless" ? "Tier-2 Pro" : player.urRank === "Supreme" ? "Tier-3 Pro" : player.urRank === "Exceed" ? "Semi-Pro" : "Amateur"}
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs italic mb-2 line-clamp-1">
                    &ldquo;{player.bio}&rdquo;
                  </p>

                  <div className="text-[9px] text-gray-500 mb-3 font-mono flex flex-col gap-0.5">
                    <div><span className="font-bold text-gray-600">Team:</span> {player.team?.name || "Free Agent"}</div>
                    {player.teamHistory && (
                      <div className="line-clamp-1"><span className="font-bold text-gray-600">History:</span> {player.teamHistory}</div>
                    )}
                    {player.achievements && (
                      <div className="line-clamp-1 text-gray-300"><span className="font-bold text-gray-400">Achievements:</span> {player.achievements}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[8px] bg-gaming-black border border-gaming-gray/60 px-3 py-1.5 rounded-xl text-gray-500">
                    <span>In-Game Tier: {player.urRank}</span>
                    <span>Win Rate: {player.winRate}%</span>
                    <span>UR K/D: {player.kdRatio.toFixed(2)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* ================= SECTION 2: FEATURED ESPORTS ROSTERS ================= */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-digital-yellow flex items-center gap-2">
            <span className="text-xl">⭐</span> FEATURED ESPORTS ROSTERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProfiles.length === 0 ? (
              <div className="col-span-full bg-[#111827]/10 border border-gaming-gray rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">⭐</span>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  No other verified competitors have registered yet. Share the portal link to start recruiting!
                </p>
              </div>
            ) : (
              featuredProfiles.map((player) => (
                <Link
                  href={`/players/${player.id}`}
                  key={player.id}
                  className="group bg-gaming-black border border-gaming-gray p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-digital-yellow/[0.02] rounded-full blur-xl" />
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gaming-black border border-gaming-gray flex items-center justify-center shrink-0">
                        {player.team?.logoUrl ? (
                          <img src={player.team.logoUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xs font-black text-gray-600">FA</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base group-hover:text-digital-yellow transition">
                          {player.ign}
                        </h3>
                        <span className="inline-block text-[8px] bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2 py-0.2 rounded font-black uppercase">
                          {player.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      ★ Featured
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs italic mb-2 line-clamp-1">
                    &ldquo;{player.bio}&rdquo;
                  </p>

                  <div className="text-[9px] text-gray-500 mb-3 font-mono flex flex-col gap-0.5">
                    <div><span className="font-bold text-gray-600">Team:</span> {player.team?.name || "Free Agent"}</div>
                    {player.teamHistory && (
                      <div className="line-clamp-1"><span className="font-bold text-gray-600">History:</span> {player.teamHistory}</div>
                    )}
                    {player.achievements && (
                      <div className="line-clamp-1 text-gray-300"><span className="font-bold text-gray-400">Achievements:</span> {player.achievements}</div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gaming-gray flex items-center justify-between text-[8px] text-gray-500">
                    <span>In-Game Tier: {player.urRank}</span>
                    <span>Win Rate: {player.winRate}%</span>
                    <span>Points: {player.urPoints}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* ================= SECTION 3: SCOUT DISCOVERY HUB SEARCH GRID ================= */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-t border-gaming-gray pt-8">
            <h2 className="text-lg font-black uppercase tracking-wider text-airdrop-red flex items-center gap-2">
              <svg className="w-5 h-5 text-airdrop-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Candidate Pool Feed
            </h2>
            
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-2 bg-gaming-gray/30 border border-gaming-gray px-4 py-2 rounded-xl text-xs font-black text-gray-300 active:bg-gaming-gray/50 transition"
            >
              <svg className="w-4 h-4 text-digital-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {showFiltersMobile ? "Hide Filters" : "Show Filters"}
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-airdrop-red text-white flex items-center justify-center text-[9px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Panel */}
            <aside
              className={`${
                showFiltersMobile ? "flex animate-fade-in" : "hidden lg:flex"
              } flex-col gap-6 lg:col-span-1 bg-gaming-black border border-gaming-gray p-6 rounded-2xl shadow-xl h-fit`}
            >
              <div className="flex items-center justify-between border-b border-gaming-gray pb-3">
                <h3 className="font-black text-xs text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  Query Controls
                </h3>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedRole("All");
                    setSelectedRegion("All");
                    setSelectedStatus("All");
                    setMinKd(0);
                    setDeviceType("All");
                    setGyro("All");
                    setSelectedUrRank("All");
                  }}
                  className="text-[9px] text-digital-yellow hover:text-white font-black uppercase tracking-wider transition"
                >
                  Clear Board
                </button>
              </div>

              {/* Search */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">IGN / Character ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type IGN or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 pl-9 text-xs focus:outline-none transition text-gray-200 placeholder-gray-600"
                  />
                  <svg
                    className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Roles pills */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Role</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`text-[9px] px-2.5 py-1 rounded border font-black uppercase transition ${
                        selectedRole === role
                          ? "bg-digital-yellow border-digital-yellow text-gaming-black font-black"
                          : "bg-gaming-black border-gaming-gray text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Experience Level</label>
                <select
                  value={selectedUrRank}
                  onChange={(e) => setSelectedUrRank(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                >
                  <option value="All">All Experience Levels</option>
                  <option value="Vanguard">Amateur</option>
                  <option value="Exceed">Semi-Pro</option>
                  <option value="Supreme">Tier-3 Pro</option>
                  <option value="Peerless">Tier-2 Pro</option>
                  <option value="Legend">Tier-1 Pro</option>
                </select>
              </div>

              {/* Region Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                >
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region === "All" ? "All Regions" : region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Availability</label>
                <div className="flex flex-col gap-2">
                  {STATUSES.map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input
                        type="radio"
                        name="status-filter"
                        checked={selectedStatus === status}
                        onChange={() => setSelectedStatus(status)}
                        className="accent-airdrop-red"
                      />
                      <span>{status === "All" ? "All Profiles" : status === "Signed" ? "Signed" : "Looking For Team"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Device Profile Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Device Profile</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "All", label: "All" },
                    { id: "tablet", label: "Tablet" },
                    { id: "phone", label: "Phone" },
                  ].map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => setDeviceType(dev.id)}
                      className={`text-[9px] py-1 border rounded font-black transition ${
                        deviceType === dev.id
                          ? "bg-digital-yellow border-digital-yellow text-gaming-black"
                          : "bg-gaming-black border-gaming-gray text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {dev.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gyroscope Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Gyroscope Setup</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "All", label: "All" },
                    { id: "on", label: "Gyro On" },
                    { id: "off", label: "Gyro Off" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGyro(g.id)}
                      className={`text-[9px] py-1 border rounded font-black transition ${
                        gyro === g.id
                          ? "bg-digital-yellow border-digital-yellow text-gaming-black"
                          : "bg-gaming-black border-gaming-gray text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* K/D Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-wider">
                  <span>Min UR K/D</span>
                  <span className="text-digital-yellow font-black">{minKd.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7.0"
                  step="0.5"
                  value={minKd}
                  onChange={(e) => setMinKd(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gaming-gray rounded-lg appearance-none cursor-pointer accent-digital-yellow"
                />
              </div>
            </aside>

            {/* Players Grid */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-wider px-1">
                <div>
                  Feed Results:{" "}
                  <span className="text-digital-yellow font-black">
                    {loading ? "..." : players.length} player(s)
                  </span>
                </div>
                {loading ? (
                  <div className="text-digital-yellow animate-pulse">Filtering DB...</div>
                ) : (
                  <div>Sorted by: Recently Updated</div>
                )}
              </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {players.map((player) => (
                    <Link
                      href={`/players/${player.id}`}
                      key={player.id}
                      className="group bg-[#0d0e12] hover:bg-[#15161c] border border-gaming-gray hover:border-digital-yellow/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-md relative overflow-hidden"
                    >
                      <div>
                        {/* Header details */}
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[8px] uppercase font-black px-2 py-0.5 rounded border ${
                              player.status === "Signed"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-airdrop-red/10 text-airdrop-red border-airdrop-red/20 animate-pulse"
                            }`}
                          >
                            {player.status === "Signed" ? "Signed" : "LFT"}
                          </span>
                          <span className="text-[8px] bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2 py-0.5 rounded font-black uppercase">
                            {player.role}
                          </span>
                        </div>

                        {/* IGN */}
                        <h3 className="text-base font-black text-white group-hover:text-digital-yellow transition uppercase tracking-wide">
                          {player.ign}
                        </h3>

                        {/* Team Details */}
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                          {player.team ? (
                            <>
                              <img src={player.team.logoUrl || ""} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
                              <span className="font-semibold text-gray-300">{player.team.name}</span>
                            </>
                          ) : (
                            <span className="text-gray-600">Free Agent</span>
                          )}
                        </div>

                        {/* Team history snippet */}
                        {player.teamHistory && (
                          <p className="text-[9px] text-gray-500 mt-1 line-clamp-1">
                            <span className="font-bold text-gray-600">History:</span> {player.teamHistory}
                          </p>
                        )}

                        {/* Achievements snippet */}
                        {player.achievements ? (
                          <div className="bg-gaming-black/60 border border-gaming-gray/40 rounded-lg p-2 mt-2 text-[9px] text-gray-300 leading-normal font-mono line-clamp-2">
                            🏆 {player.achievements}
                          </div>
                        ) : (
                          <div className="mt-2 text-[9px] text-gray-600 italic line-clamp-2">
                            No achievements registered yet.
                          </div>
                        )}
                      </div>

                      {/* Curated slots */}
                      <div className="border-t border-gaming-gray mt-3 pt-2.5 grid grid-cols-3 gap-1.5 text-center text-[9px]">
                        <div className="bg-gaming-black/60 py-1.5 rounded-lg border border-gaming-gray/40">
                          <span className="text-gray-500 block uppercase font-black">Tourney Tier</span>
                          <span className="font-black text-digital-yellow text-[9px] mt-0.5 block">
                            {player.urRank === "Legend" ? "Tier-1 Pro" : player.urRank === "Peerless" ? "Tier-2 Pro" : player.urRank === "Supreme" ? "Tier-3 Pro" : player.urRank === "Exceed" ? "Semi-Pro" : "Amateur"}
                          </span>
                        </div>
                        <div className="bg-gaming-black/60 py-1.5 rounded-lg border border-gaming-gray/40">
                          <span className="text-gray-500 block uppercase font-black">Win Rate</span>
                          <span className="font-black text-gray-200 text-xs mt-0.5 block">{player.winRate}%</span>
                        </div>
                        <div className="bg-gaming-black/60 py-1.5 rounded-lg border border-gaming-gray/40">
                          <span className="text-gray-500 block uppercase font-black">Region</span>
                          <span className="font-black text-gray-300 text-xs mt-0.5 block">{player.region}</span>
                        </div>
                      </div>

                      {/* Footnote */}
                      <div className="mt-3 pt-2 border-t border-gaming-gray/40 flex justify-between items-center text-[8px] text-gray-600 font-mono">
                        <span>In-Game Tier: {player.urRank}</span>
                        <span>UR K/D: {player.kdRatio.toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
