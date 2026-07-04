"use client";

import React from "react";
import Link from "next/link";

interface Player {
  id: string;
  ign: string;
  role: string;
  avatarUrl: string | null;
  region: string;
  urRank: string;
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

export default function OrgProfileClient({
  organization,
  isOwner,
}: {
  organization: Organization;
  isOwner: boolean;
}) {
  return (
    <div className="min-h-screen bg-gaming-black text-gray-100 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
        
        {/* Back Link */}
        <div className="text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-digital-yellow transition"
          >
            ← Back to Directory
          </Link>
        </div>

        {/* Cyber Hero Banner / Profile Block */}
        <div className="relative bg-[#0c0e12] border border-gaming-gray rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          {/* Neon highlight glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-digital-yellow/[0.03] rounded-full blur-2xl pointer-events-none" />

          {/* Org Logo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative group">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                alt={organization.name}
              />
            ) : (
              <span className="text-4xl">🏢</span>
            )}
          </div>

          {/* Info Details */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white truncate">
                {organization.name}
              </h1>
              <span className="self-center sm:self-auto text-[9px] bg-digital-yellow/15 text-digital-yellow border border-digital-yellow/30 px-2.5 py-0.5 rounded font-black tracking-widest uppercase">
                VERIFIED ORG
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-lg mt-1">
              Active developer & organizer representing PUBG Mobile competitive squads. Verified roster administrator.
            </p>
          </div>

          {isOwner && (
            <div className="shrink-0">
              <Link
                href="/dashboard"
                className="bg-digital-yellow hover:bg-amber-500 text-gaming-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl transition shadow-lg shadow-amber-950/20 cursor-pointer block text-center"
              >
                Manage Rosters
              </Link>
            </div>
          )}
        </div>

        {/* Rosters Section */}
        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-lg font-black uppercase tracking-wider text-digital-yellow flex items-center gap-2">
            <span className="text-xl">🏆</span> Active Esports Lineups ({organization.rosters.length})
          </h2>

          {organization.rosters.length === 0 ? (
            <div className="bg-[#0c0e12] border border-dashed border-gaming-gray/60 rounded-3xl p-12 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
              No active approved rosters configured for this organization.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {organization.rosters.map((roster) => (
                <div
                  key={roster.id}
                  className="bg-[#0c0e12] border border-gaming-gray rounded-3xl p-6 shadow-xl flex flex-col gap-5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-gaming-gray/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
                        {roster.logoUrl ? (
                          <img src={roster.logoUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-xl">🎮</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base uppercase tracking-wide">
                          {roster.teamName} {roster.tag && <span className="text-xs text-gray-500 font-mono">[{roster.tag}]</span>}
                        </h3>
                        <p className="text-[9px] text-[#10B981] uppercase tracking-widest font-black">
                          Verified active squad
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Player Grid List */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Official Squad Lineup</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roster.players.map((player) => (
                        <Link
                          key={player.id}
                          href={`/players/${player.id}`}
                          className="bg-gaming-black hover:border-digital-yellow/50 border border-gaming-gray/60 rounded-2xl p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                        >
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
                          <div className="truncate min-w-0 text-left">
                            <div className="text-xs font-bold text-white uppercase group-hover:text-digital-yellow transition-colors truncate">
                              {player.ign}
                            </div>
                            <div className="text-[8px] text-gray-500 uppercase font-black tracking-wider">
                              {player.role}
                            </div>
                          </div>
                        </Link>
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
  );
}
