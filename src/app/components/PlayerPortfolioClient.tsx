"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Teammate {
  id: string;
  ign: string;
  role: string;
  status: string;
  kdRatio: number;
  urRank: string;
}

interface Team {
  id: string;
  name: string;
  tag: string;
  logoUrl: string | null;
  region: string;
  players?: Teammate[];
}

interface Placement {
  id: string;
  date: string;
  tournamentName: string;
  teamRepresented: string;
  placement: number;
}

interface Highlight {
  id: string;
  title: string;
  url: string;
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
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  discord: string | null;
  team: Team | null;
  placements: Placement[];
  highlights: Highlight[];
}

interface PlayerPortfolioClientProps {
  player: Player;
  isOwner: boolean;
}

type TabType = "stats" | "setup" | "trophies" | "highlights" | "edit";

const UR_RANKS = ["Vanguard", "Exceed", "Supreme", "Peerless", "Legend"];

// Styled Discord copyable badge component
function DiscordBadge({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 bg-[#5865f2]/10 hover:bg-[#5865f2]/20 border border-[#5865f2]/30 hover:border-[#5865f2] text-[#5865f2] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition cursor-pointer"
      title="Click to copy Discord Username"
    >
      <span className="text-xs">💬</span> {copied ? "Copied Discord!" : `Discord: ${username}`}
    </button>
  );
}

export default function PlayerPortfolioClient({ player, isOwner }: PlayerPortfolioClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Edit profile form states
  const [editStatus, setEditStatus] = useState(player.status);
  const [editKd, setEditKd] = useState(player.kdRatio.toString());
  const [editHs, setEditHs] = useState(player.headshotPct.toString());
  const [editWr, setEditWr] = useState(player.winRate.toString());
  const [editMatches, setEditMatches] = useState(player.matchesPlayed.toString());
  const [editUrRank, setEditUrRank] = useState(player.urRank);
  const [editUrPoints, setEditUrPoints] = useState(player.urPoints.toString());
  const [editDevice, setEditDevice] = useState(player.device);
  const [editSetup, setEditSetup] = useState(player.controlSetup);
  const [editBio, setEditBio] = useState(player.bio);

  const [editFacebook, setEditFacebook] = useState(player.facebook || "");
  const [editInstagram, setEditInstagram] = useState(player.instagram || "");
  const [editTwitter, setEditTwitter] = useState(player.twitter || "");
  const [editDiscord, setEditDiscord] = useState(player.discord || "");

  // New Trophy form states
  const [newTrophyName, setNewTrophyName] = useState("");
  const [newTrophyPlacement, setNewTrophyPlacement] = useState("1");
  const [newTrophyTeam, setNewTrophyTeam] = useState(player.team?.name || "Free Agent");
  const [newTrophyDate, setNewTrophyDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  // Handles PUT profile save updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      alert("Error: You do not own this profile card.");
      return;
    }

    setSaving(true);
    setSaveSuccess("");

    const payload: any = {
      status: editStatus,
      kdRatio: parseFloat(editKd) || 0,
      headshotPct: parseFloat(editHs) || 0,
      winRate: parseFloat(editWr) || 0,
      matchesPlayed: parseInt(editMatches) || 0,
      urRank: editUrRank,
      urPoints: parseInt(editUrPoints) || 0,
      device: editDevice,
      controlSetup: editSetup,
      bio: editBio,
      facebook: editFacebook || null,
      instagram: editInstagram || null,
      twitter: editTwitter || null,
      discord: editDiscord || null,
    };

    // If new trophy fields are filled, append it
    if (newTrophyName) {
      payload.newTrophy = {
        tournamentName: newTrophyName,
        placement: parseInt(newTrophyPlacement) || 1,
        teamRepresented: newTrophyTeam,
        date: newTrophyDate,
      };
    }

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess("Profile Successfully Updated!");
        // Clear new trophy inputs
        setNewTrophyName("");
        setNewTrophyPlacement("1");
        setNewTrophyDate("");
        
        // Refresh server component data
        router.refresh();
        
        // Delay tab swap to let user see success message
        setTimeout(() => {
          setSaveSuccess("");
          setActiveTab("stats");
        }, 1200);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile due to a network error.");
    } finally {
      setSaving(false);
    }
  };

  // Timeline placement styling helper
  const getTrophyColor = (placement: number) => {
    if (placement === 1) return { text: "1st Place", border: "border-digital-yellow", bg: "bg-digital-yellow/10", textCol: "text-digital-yellow" };
    if (placement === 2) return { text: "2nd Place", border: "border-gray-400", bg: "bg-gray-400/10", textCol: "text-gray-300" };
    if (placement === 3) return { text: "3rd Place", border: "border-amber-700", bg: "bg-amber-700/10", textCol: "text-amber-500" };
    return { text: `${placement}th Place`, border: "border-gaming-gray", bg: "bg-gaming-gray/30", textCol: "text-gray-400" };
  };

  return (
    <div className="flex-1 w-full bg-gaming-black text-gray-100 min-h-screen py-10 px-4 md:px-8 relative">
      {/* Navigation Header */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-airdrop-red uppercase tracking-widest transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Discovery Hub
        </Link>

        {isOwner && (
          <span className="text-[10px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-3 py-1 rounded-xl tracking-wider">
            🛡️ Viewing Your Card (Owner)
          </span>
        )}
      </div>

      {/* ================= ESPORTS PLAYER CARD BANNER ================= */}
      <div className="max-w-5xl mx-auto bg-gaming-black border-2 border-gaming-gray rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(255,189,3,0.06)] mb-8">
        <div className="relative bg-gradient-to-r from-gaming-gray via-gaming-black to-[#050608] p-6 md:p-10 border-b-2 border-gaming-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Cybernetic grid bg */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Left Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Team Logo Avatar */}
            <div className="relative w-24 h-24 rounded-2xl bg-gaming-black border-2 border-gaming-gray flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-digital-yellow/10 to-transparent pointer-events-none" />
              {player.team?.logoUrl ? (
                <img src={player.team.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-gaming-gray">FA</span>
              )}
            </div>

            <div className="text-center sm:text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span
                  className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded border ${
                    player.status === "Signed"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-airdrop-red/10 text-airdrop-red border-airdrop-red/30 animate-pulse"
                  }`}
                >
                  {player.status === "Signed" ? "Signed" : "LFT / Free Agent"}
                </span>
                <span className="bg-gaming-gray text-gray-300 text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded border border-gray-700">
                  {player.role}
                </span>
                <span className="bg-gaming-gray text-gray-300 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded border border-gray-700">
                  {player.region}
                </span>
              </div>

              {/* IGN */}
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-3">
                {player.ign}
              </h1>
              <p className="text-gray-500 text-xs mt-1 font-mono">Character ID: {player.characterId}</p>

              {/* Bio */}
              <p className="text-gray-300 text-sm mt-3 max-w-xl leading-relaxed italic">
                &ldquo;{player.bio}&ldquo;
              </p>

              {/* Recruitment Contacts panel */}
              {(player.twitter || player.discord || player.instagram || player.facebook) && (
                <div className="flex flex-wrap gap-2.5 mt-4 relative z-25">
                  {/* Twitter / X */}
                  {player.twitter && (
                    <a
                      href={player.twitter.startsWith("http") ? player.twitter : `https://${player.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/30 hover:border-[#1da1f2] text-[#1da1f2] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition"
                    >
                      <span className="text-xs">𝕏</span> Twitter
                    </a>
                  )}

                  {/* Discord Username (Copyable Badge) */}
                  {player.discord && (
                    <DiscordBadge username={player.discord} />
                  )}

                  {/* Instagram */}
                  {player.instagram && (
                    <a
                      href={player.instagram.startsWith("http") ? player.instagram : `https://${player.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#e1306c]/10 hover:bg-[#e1306c]/20 border border-[#e1306c]/30 hover:border-[#e1306c] text-[#e1306c] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition"
                    >
                      <span className="text-xs">📸</span> Instagram
                    </a>
                  )}

                  {/* Facebook */}
                  {player.facebook && (
                    <a
                      href={player.facebook.startsWith("http") ? player.facebook : `https://${player.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/30 hover:border-[#1877f2] text-[#1877f2] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition"
                    >
                      <span className="text-xs">👥</span> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Info */}
          <div className="flex flex-col gap-3 shrink-0 relative z-10 min-w-[200px] w-full md:w-auto">
            {player.team ? (
              <div className="bg-gaming-black/90 border border-gaming-gray p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Teammates</div>
                <div className="flex items-center gap-2">
                  <img src={player.team.logoUrl || ""} className="w-4 h-4 rounded-full object-cover" alt="" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{player.team.name}</span>
                </div>
                <button
                  onClick={() => setShowRosterModal(true)}
                  className="mt-2 text-center text-xs font-black text-digital-yellow hover:text-white border border-digital-yellow/30 hover:border-digital-yellow bg-digital-yellow/5 py-1.5 rounded-lg transition"
                >
                  View Team Roster
                </button>
              </div>
            ) : (
              <div className="bg-airdrop-red/5 border border-airdrop-red/20 p-4 rounded-xl text-center">
                <div className="text-[9px] text-airdrop-red font-black uppercase tracking-wider mb-1">Status</div>
                <div className="text-sm font-black text-airdrop-red uppercase tracking-wider">LFT</div>
                <div className="text-[10px] text-gray-500 mt-1">Available for active tryouts</div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gaming-gray bg-gaming-gray/20 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: "stats", label: "UR Season Stats" },
            { id: "setup", label: "Control Setup" },
            { id: "trophies", label: `Trophy Room (${player.placements.length})` },
            { id: "highlights", label: `Showcase reels (${player.highlights.length})` },
            ...(isOwner ? [{ id: "edit", label: "⚙️ Edit Profile" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-3.5 text-xs font-black uppercase tracking-widest transition border-b-2 ${
                activeTab === tab.id
                  ? "border-digital-yellow text-digital-yellow bg-digital-yellow/[0.02]"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= SCANNABLE BLOCKS ================= */}
        <div className="p-6 md:p-8 bg-[#0D0E12]">
          {/* TAB: Stats Snapshot Grid */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Block */}
              <div className="md:col-span-2 bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-6">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> UR Season Stats Snapshot
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray">
                    <div className="text-gray-500 text-[9px] font-black uppercase tracking-wider">UR Matches</div>
                    <div className="text-xl font-black text-white mt-1">{player.matchesPlayed}</div>
                  </div>
                  <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray">
                    <div className="text-gray-500 text-[9px] font-black uppercase tracking-wider">UR K/D Ratio</div>
                    <div className="text-xl font-black text-airdrop-red mt-1">{player.kdRatio.toFixed(2)}</div>
                  </div>
                  <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray">
                    <div className="text-gray-500 text-[9px] font-black uppercase tracking-wider">UR Headshot %</div>
                    <div className="text-xl font-black text-white mt-1">{player.headshotPct}%</div>
                  </div>
                  <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray">
                    <div className="text-gray-500 text-[9px] font-black uppercase tracking-wider">UR Win Rate</div>
                    <div className="text-xl font-black text-white mt-1">{player.winRate}%</div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="flex flex-col gap-5 mt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                      <span>UR K/D Performance Ratio</span>
                      <span className="font-black text-airdrop-red">{player.kdRatio.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gaming-black h-2.5 rounded-full overflow-hidden border border-gaming-gray">
                      <div
                        className="bg-airdrop-red h-full rounded-full"
                        style={{ width: `${Math.min(player.kdRatio * 12.5, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                      <span>UR Headshot Accuracy</span>
                      <span className="font-black text-digital-yellow">{player.headshotPct}%</span>
                    </div>
                    <div className="w-full bg-gaming-black h-2.5 rounded-full overflow-hidden border border-gaming-gray">
                      <div
                        className="bg-digital-yellow h-full rounded-full"
                        style={{ width: `${(player.headshotPct / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranks Block */}
              <div className="bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-4">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Ultimate Royale Status
                </h3>

                <div className="flex flex-col gap-5">
                  <div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">UR Rank Tier</span>
                    <div className="text-lg font-black text-digital-yellow uppercase mt-1">
                      👑 {player.urRank}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Season Points</span>
                    <div className="text-xl font-black text-white mt-1">
                      {player.urPoints} pts
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Scout Rating</span>
                    <div className="text-2xl font-black text-airdrop-red mt-1">
                      {Math.round(player.kdRatio * 10 + player.winRate * 2)} <span className="text-xs text-gray-500 font-normal">/ 150</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Control Setup */}
          {activeTab === "setup" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Playstyle */}
              <div className="bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Playstyle Role
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="bg-airdrop-red/10 text-airdrop-red border border-airdrop-red/20 text-xs font-black px-3 py-1 rounded uppercase tracking-wider inline-block">
                      {player.role}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {player.role === "IGL" && "Directs team strategy, rotation routes, compound takes, and split layouts in matches."}
                    {player.role === "Entry Fragger" && "Leads compound pushes, closes down angles, and secures first knocks in close duels."}
                    {player.role === "Sniper" && "Secures distance knocks using bolt-action and DMR sniper rifles, providing overview cover."}
                    {player.role === "Support" && "Coordinates utility deployment (smokes, zone nades), vehicle preservation, and team revives."}
                  </p>
                </div>
              </div>

              {/* Hardware */}
              <div className="bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Hardware Setup
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="bg-gaming-black p-3.5 rounded-xl border border-gaming-gray flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">Gaming Device</span>
                      <span className="font-bold text-white mt-1 block">{player.device}</span>
                    </div>
                  </div>

                  <div className="bg-gaming-black p-3.5 rounded-xl border border-gaming-gray flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block">Claw Configuration</span>
                      <span className="font-bold text-white mt-1 block">{player.controlSetup}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Trophy Room Timeline */}
          {activeTab === "trophies" && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-digital-yellow" /> Trophy Room Placements
              </h3>

              {player.placements.length === 0 ? (
                <div className="bg-gaming-black/30 border border-gaming-gray rounded-xl p-8 text-center text-gray-500 text-xs">
                  No verified placements recorded.
                </div>
              ) : (
                /* VERTICAL TIMELINE CONTAINER */
                <div className="relative pl-6 border-l-2 border-digital-yellow/30 flex flex-col gap-8 py-2">
                  {player.placements.map((placement) => {
                    const style = getTrophyColor(placement.placement);
                    return (
                      <div key={placement.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Timeline Node dot */}
                        <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 bg-gaming-black ${style.border} flex items-center justify-center`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${placement.placement === 1 ? "bg-digital-yellow" : "bg-gray-400"}`} />
                        </div>

                        {/* Timeline Content Block */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl border font-black text-sm flex items-center justify-center shrink-0 shadow-inner ${style.bg} ${style.border} ${style.textCol}`}>
                            {placement.placement === 1 && "🥇"}
                            {placement.placement === 2 && "🥈"}
                            {placement.placement === 3 && "🥉"}
                            {placement.placement > 3 && `${placement.placement}th`}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm sm:text-base">
                              {placement.tournamentName}
                            </h4>
                            <p className="text-gray-400 text-xs mt-0.5">
                              Roster Tag: <span className="text-white font-semibold">{placement.teamRepresented}</span>
                            </p>
                          </div>
                        </div>

                        {/* Date label */}
                        <div className="text-right sm:border-l border-gaming-gray sm:pl-6 shrink-0">
                          <span className="text-[9px] text-gray-500 font-black block uppercase tracking-wider">Date</span>
                          <span className="text-xs font-bold text-gray-300 mt-0.5 block">{placement.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Highlights Reels */}
          {activeTab === "highlights" && (
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-digital-yellow" /> Video Showcase Reels
              </h3>

              {player.highlights.length === 0 ? (
                <div className="bg-gaming-black/30 border border-gaming-gray rounded-xl p-8 text-center text-gray-500 text-xs">
                  No showcase clips recorded.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {player.highlights.map((hl) => (
                    <div key={hl.id} className="flex flex-col gap-2">
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gaming-gray bg-black shadow-lg">
                        <iframe
                          src={hl.url}
                          title={hl.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <span className="font-black text-xs text-gray-300 px-1">{hl.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Secure Edit Dashboard */}
          {activeTab === "edit" && isOwner && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 animate-fade-in">
              <div className="border-b border-gaming-gray pb-3 flex items-center justify-between">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Edit Roster Portfolio
                </h3>
                {saveSuccess && (
                  <span className="text-xs font-black text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg animate-pulse">
                    {saveSuccess}
                  </span>
                )}
              </div>

              {/* Edit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Col 1: Details */}
                <div className="flex flex-col gap-4 bg-gaming-black p-5 rounded-2xl border border-gaming-gray">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Performance Details</h4>

                  {/* LFT Toggle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Availability Status</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="edit-status"
                          checked={editStatus === "Looking For Team"}
                          onChange={() => setEditStatus("Looking For Team")}
                          className="accent-airdrop-red"
                        />
                        <span>Looking For Team (LFT)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="edit-status"
                          checked={editStatus === "Signed"}
                          onChange={() => setEditStatus("Signed")}
                          className="accent-airdrop-red"
                        />
                        <span>Signed to Roster</span>
                      </label>
                    </div>
                  </div>

                  {/* Numbers row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UR K/D Ratio (0-15)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="15"
                        value={editKd}
                        onChange={(e) => setEditKd(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UR Headshot %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editHs}
                        onChange={(e) => setEditHs(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UR Win Rate %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editWr}
                        onChange={(e) => setEditWr(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UR Matches</label>
                      <input
                        type="number"
                        min="0"
                        value={editMatches}
                        onChange={(e) => setEditMatches(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UR Rank Tier</label>
                      <select
                        value={editUrRank}
                        onChange={(e) => setEditUrRank(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                      >
                        {UR_RANKS.map((tier) => (
                          <option key={tier} value={tier}>
                            {tier}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Season Points</label>
                      <input
                        type="number"
                        min="0"
                        value={editUrPoints}
                        onChange={(e) => setEditUrPoints(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Col 2: Settings & Bio */}
                <div className="flex flex-col gap-4 bg-gaming-black p-5 rounded-2xl border border-gaming-gray">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Setup & Bio</h4>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gaming Device</label>
                    <input
                      type="text"
                      value={editDevice}
                      onChange={(e) => setEditDevice(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Control Setup</label>
                    <input
                      type="text"
                      value={editSetup}
                      onChange={(e) => setEditSetup(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bio Narrative</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Social links editor */}
              <div className="bg-gaming-black p-5 rounded-2xl border border-gaming-gray flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gaming-gray pb-2 mb-1 flex items-center gap-1.5">
                  📱 Social Links & Recruitment Contact Channels
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Twitter / X handle</label>
                    <input
                      type="text"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discord tag</label>
                    <input
                      type="text"
                      value={editDiscord}
                      onChange={(e) => setEditDiscord(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Instagram link</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Facebook link</label>
                    <input
                      type="text"
                      value={editFacebook}
                      onChange={(e) => setEditFacebook(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Add New Trophy Block (Optional) */}
              <div className="bg-gaming-black p-5 rounded-2xl border border-gaming-gray flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gaming-gray pb-2 mb-1 flex items-center gap-1.5">
                  🏆 Log New Trophy Placement (Optional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tournament Name</label>
                    <input
                      type="text"
                      placeholder="e.g. PMPL NA Spring"
                      value={newTrophyName}
                      onChange={(e) => setNewTrophyName(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Placement (Number)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={newTrophyPlacement}
                      onChange={(e) => setNewTrophyPlacement(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Team Represented</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Esports"
                      value={newTrophyTeam}
                      onChange={(e) => setNewTrophyTeam(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tournament Date (YYYY-MM)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-06"
                      value={newTrophyDate}
                      onChange={(e) => setNewTrophyDate(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gaming-gray">
                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className="bg-gaming-gray hover:bg-gray-800 text-gray-200 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition shadow-md shadow-amber-950/20"
                >
                  {saving ? "Saving Changes..." : "Save Portfolio"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Roster Teammates Modal */}
      {showRosterModal && player.team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-gaming-black border-2 border-gaming-gray w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gaming-gray bg-gaming-gray/20">
              <div className="flex items-center gap-2">
                <img src={player.team.logoUrl || ""} className="w-5 h-5 rounded-full object-cover" alt="" />
                <h3 className="font-black text-xs text-white uppercase tracking-widest">{player.team.name} Active Roster</h3>
              </div>
              <button onClick={() => setShowRosterModal(false)} className="text-gray-400 hover:text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin">
              {player.team.players?.map((mate) => (
                <div
                  key={mate.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    mate.id === player.id
                      ? "bg-digital-yellow/5 border-digital-yellow/30"
                      : "bg-[#0b0f19] border-gaming-gray"
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-white flex items-center gap-1.5 uppercase">
                      {mate.ign}
                      {mate.id === player.id && (
                        <span className="text-[8px] bg-digital-yellow text-gaming-black font-black px-1 rounded uppercase tracking-wider">
                          Viewing
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{mate.role}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">UR K/D</span>
                    <span className="font-black text-airdrop-red text-sm">{mate.kdRatio.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gaming-gray bg-gaming-gray/20 text-right">
              <button
                onClick={() => setShowRosterModal(false)}
                className="bg-gaming-gray hover:bg-gray-800 text-gray-200 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
