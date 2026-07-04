"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  ign: string;
  role: string;
  avatarUrl: string | null;
  region: string;
}

interface TeamRoster {
  id: string;
  teamName: string;
  tag: string | null;
  logoUrl: string | null;
  status: string;
  players: Player[];
  createdAt: Date | string;
}

interface Organization {
  id: string;
  email: string;
  name: string;
  logoUrl: string | null;
  rosters: TeamRoster[];
}

export default function OrgDashboardClient({ organization }: { organization: Organization }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [tag, setTag] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Search players from DB as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out already selected players
          const filtered = data.filter((p: Player) => !selectedPlayers.some((sp) => sp.id === p.id));
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Failed to search players:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, selectedPlayers]);

  const handleSelectPlayer = (player: Player) => {
    if (selectedPlayers.length >= 6) {
      setError("Roster maximum capacity reached (6 players max).");
      return;
    }
    setError("");
    setSelectedPlayers((prev) => [...prev, player]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (selectedPlayers.length < 4) {
      setError("You must select at least 4 players for the roster.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/organization/rosters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          tag: tag.trim() || null,
          logoUrl: logoUrl.trim() || null,
          playerIds: selectedPlayers.map((p) => p.id),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Roster submission registered! Status: PENDING admin approval.");
        setTeamName("");
        setTag("");
        setLogoUrl("");
        setSelectedPlayers([]);
        router.refresh();
      } else {
        setError(data.error || "Failed to submit roster.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Failed to submit roster.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gaming-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gaming-gray/30 pb-6">
          <div className="text-left">
            <h1 className="text-2xl font-black uppercase text-white tracking-widest flex items-center gap-2">
              🏢 {organization.name} <span className="text-xs bg-digital-yellow/15 text-digital-yellow border border-digital-yellow/30 px-2 py-0.5 rounded font-black tracking-normal uppercase">Organization Portal</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">Configure your official esports squads and submit them for verification approval.</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-center bg-gaming-gray hover:bg-red-500/10 hover:text-red-400 border border-gaming-gray hover:border-red-500/30 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Builder Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-6 shadow-[0_0_20px_rgba(255,189,3,0.02)] text-left flex flex-col gap-5">
              <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-gaming-gray/30 pb-3">
                🛠️ Roster Application Builder
              </h2>

              {error && (
                <div className="bg-airdrop-red/10 border border-airdrop-red/30 text-airdrop-red rounded-xl px-4 py-3 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-xl px-4 py-3 text-xs font-semibold">
                  🎉 {success}
                </div>
              )}

              {/* Row 1: Roster branding details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Team / Squad Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APX Esports"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Team Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. APX"
                    maxLength={5}
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition w-full uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Team Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition w-full"
                />
              </div>

              {/* Player Selector section */}
              <div className="flex flex-col gap-3 pt-3 border-t border-gaming-gray/30">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-white uppercase tracking-wider">Search & Add Players (4-6 Slots)</label>
                  <span className="text-[10px] text-gray-500 font-bold">{selectedPlayers.length} / 6 SELECTED</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type IGN to search registered players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition w-full"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-3 text-[10px] text-digital-yellow animate-pulse font-bold">Searching...</div>
                  )}

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-[#0d0e12] border border-gaming-gray rounded-xl shadow-2xl overflow-hidden z-20 max-h-52 overflow-y-auto">
                      {searchResults.map((player) => (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handleSelectPlayer(player)}
                          className="w-full px-4 py-2.5 flex items-center justify-between border-b border-gaming-gray/30 hover:bg-gaming-gray/20 transition text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden shrink-0 flex items-center justify-center">
                              {player.avatarUrl ? (
                                <img src={player.avatarUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                                  <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                                  <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-black text-white uppercase tracking-wide">{player.ign}</div>
                              <div className="text-[9px] text-gray-500 uppercase tracking-widest">{player.region}</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-digital-yellow border border-digital-yellow/30 bg-digital-yellow/5 px-2 py-0.5 rounded">
                            {player.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Players list */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {selectedPlayers.length === 0 ? (
                    <div className="border border-dashed border-gaming-gray/40 rounded-xl p-8 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                      No players selected yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-[#0b0f19] border border-gaming-gray rounded-2xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden shrink-0 flex items-center justify-center">
                              {player.avatarUrl ? (
                                <img src={player.avatarUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                                  <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                                  <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                                </svg>
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-extrabold text-white truncate uppercase">{player.ign}</div>
                              <div className="text-[8px] text-gray-500 uppercase font-black">{player.role}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-xs font-black uppercase text-red-500 hover:text-red-400 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black uppercase tracking-widest text-xs py-3 rounded-2xl w-full transition shadow-lg shadow-amber-950/20 cursor-pointer text-center"
              >
                {submitting ? "Submitting Roster..." : "Submit Roster for Verification"}
              </button>
            </form>
          </div>

          {/* RIGHT: Roster Application History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-6 shadow-[0_0_20px_rgba(255,189,3,0.02)] text-left flex flex-col gap-4">
              <h2 className="text-base font-black uppercase text-white tracking-wider border-b border-gaming-gray/30 pb-3">
                📋 Roster Submissions ({organization.rosters.length})
              </h2>

              {organization.rosters.length === 0 ? (
                <p className="text-gray-500 text-xs py-8 text-center font-semibold">No roster applications submitted yet.</p>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {organization.rosters.map((roster) => (
                    <div
                      key={roster.id}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-white text-sm uppercase tracking-wide flex items-center gap-1.5">
                            {roster.teamName} {roster.tag && <span className="text-[10px] text-gray-500 font-mono">[{roster.tag}]</span>}
                          </h3>
                          <span className="text-[8px] text-gray-500 font-mono uppercase">{new Date(roster.createdAt).toLocaleString()}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                          roster.status === "APPROVED" ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30" :
                          roster.status === "REJECTED" ? "bg-airdrop-red/15 text-airdrop-red border border-airdrop-red/30" :
                          "bg-digital-yellow/15 text-digital-yellow border border-digital-yellow/30 animate-pulse"
                        }`}>
                          {roster.status}
                        </span>
                      </div>

                      {/* Roster players list */}
                      <div className="flex flex-col gap-1.5 border-t border-gaming-gray/20 pt-2">
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Lineup</span>
                        <div className="flex flex-wrap gap-1.5">
                          {roster.players.map((player) => (
                            <span
                              key={player.id}
                              className="text-[9px] font-black uppercase bg-gaming-gray/40 border border-gaming-gray/60 px-2 py-0.5 rounded-lg text-gray-300"
                            >
                              🎮 {player.ign}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
