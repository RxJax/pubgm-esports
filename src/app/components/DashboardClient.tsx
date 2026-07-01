"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  discord: string | null;
  teamHistory: string | null;
  achievements: string | null;
  placements: Placement[];
  highlights: Highlight[];
  team: Team | null;
}

interface DashboardClientProps {
  player: Player;
}

const UR_RANKS = ["Vanguard", "Exceed", "Supreme", "Peerless", "Legend"];

export default function DashboardClient({ player }: DashboardClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  // Form states
  const [ign, setIgn] = useState(player.ign);
  const [status, setStatus] = useState(player.status);
  const [kdRatio, setKdRatio] = useState(player.kdRatio.toString());
  const [headshotPct, setHeadshotPct] = useState(player.headshotPct.toString());
  const [winRate, setWinRate] = useState(player.winRate.toString());
  const [matchesPlayed, setMatchesPlayed] = useState(player.matchesPlayed.toString());
  const [urRank, setUrRank] = useState(player.urRank);
  const [urPoints, setUrPoints] = useState(player.urPoints.toString());
  const [device, setDevice] = useState(player.device);
  const [controlSetup, setControlSetup] = useState(player.controlSetup);
  const [bio, setBio] = useState(player.bio);
  const [teamHistory, setTeamHistory] = useState(player.teamHistory || "");
  const [achievements, setAchievements] = useState(player.achievements || "");

  const [facebook, setFacebook] = useState(player.facebook || "");
  const [instagram, setInstagram] = useState(player.instagram || "");
  const [twitter, setTwitter] = useState(player.twitter || "");
  const [discord, setDiscord] = useState(player.discord || "");
  const [characterId, setCharacterId] = useState(player.characterId);

  // New Trophy form states
  const [trophyName, setTrophyName] = useState("");
  const [trophyPlacement, setTrophyPlacement] = useState("1");
  const [trophyTeam, setTrophyTeam] = useState(player.team?.name || "Free Agent");
  const [trophyDate, setTrophyDate] = useState("");

  // Submit profile edits
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess("");

    const payload: any = {
      ign,
      characterId,
      status,
      kdRatio: parseFloat(kdRatio) || 0,
      headshotPct: parseFloat(headshotPct) || 0,
      winRate: parseFloat(winRate) || 0,
      matchesPlayed: parseInt(matchesPlayed) || 0,
      urRank,
      urPoints: parseInt(urPoints) || 0,
      device,
      controlSetup,
      bio,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      discord: discord || null,
      teamHistory: teamHistory || null,
      achievements: achievements || null,
    };

    // If new trophy filled, append it
    if (trophyName) {
      payload.newTrophy = {
        tournamentName: trophyName,
        placement: parseInt(trophyPlacement) || 1,
        teamRepresented: trophyTeam,
        date: trophyDate,
      };
    }

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess("Portfolio successfully saved!");
        setTrophyName("");
        setTrophyPlacement("1");
        setTrophyDate("");
        
        router.refresh();
        setTimeout(() => {
          setSaveSuccess("");
        }, 3000);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Update failed"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile due to connection error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-gaming-black text-gray-100 min-h-screen py-10 px-4 md:px-8">
      {/* Dashboard Top bar */}
      <header className="max-w-5xl mx-auto mb-8 border-b border-gaming-gray pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2 py-0.5 rounded tracking-wider">
            Player Console
          </span>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider mt-2">
            My Portfolio Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your Ultimate Royale stats, tryout status, and visual player card.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/players/${player.id}`}
            className="border border-gaming-gray hover:border-digital-yellow bg-gaming-gray/30 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition"
          >
            👁️ View Public Profile
          </Link>
        </div>
      </header>

      {/* Main Dashboard Form layout */}
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Success / Saving HUD banner */}
          {(saveSuccess || saving) && (
            <div className={`p-4 rounded-xl border text-xs font-black text-center animate-pulse ${
              saveSuccess ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-digital-yellow/10 border-digital-yellow/20 text-digital-yellow"
            }`}>
              {saveSuccess ? `🏆 ${saveSuccess}` : "💾 Uploading portfolio updates to database..."}
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Block: Account Details */}
            <div className="lg:col-span-2 bg-[#0d0e12] border border-gaming-gray rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-digital-yellow" /> Player Identity Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In-Game Name (IGN)</label>
                  <input
                    type="text"
                    value={ign}
                    onChange={(e) => setIgn(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UID (In-Game ID)</label>
                  <input
                    type="text"
                    value={characterId}
                    onChange={(e) => setCharacterId(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Ultimate Royale Standing Row */}
              <div className="grid grid-cols-2 gap-4 border-t border-gaming-gray/40 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Competitive Tier / Experience</label>
                  <select
                    value={urRank}
                    onChange={(e) => setUrRank(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                  >
                    <option value="Vanguard">Amateur</option>
                    <option value="Exceed">Semi-Pro</option>
                    <option value="Supreme">Tier-3 Pro</option>
                    <option value="Peerless">Tier-2 Pro</option>
                    <option value="Legend">Tier-1 Pro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ultimate season points</label>
                  <input
                    type="number"
                    min="0"
                    value={urPoints}
                    onChange={(e) => setUrPoints(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Competitive Team History & Roster Achievements Section */}
              <div className="flex flex-col gap-4 border-t border-gaming-gray/40 pt-4">
                <h4 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Competitive & Roster Portfolio Details
                </h4>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Competitive Team History / Former Orgs</label>
                  <input
                    type="text"
                    value={teamHistory}
                    onChange={(e) => setTeamHistory(e.target.value)}
                    placeholder="e.g. Nova Esports, Alpha Team, Free Agent"
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tournament Achievements & Roster Highlights</label>
                  <textarea
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="e.g. 1st Place PMCO 2025, MVP PMSL Season 2"
                    rows={3}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Status Radio buttons */}
              <div className="flex flex-col gap-1.5 border-t border-gaming-gray/40 pt-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LFT Availability Status</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Looking For Team"}
                      onChange={() => setStatus("Looking For Team")}
                      className="accent-airdrop-red"
                    />
                    <span>Looking For Team (LFT)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Signed"}
                      onChange={() => setStatus("Signed")}
                      className="accent-airdrop-red"
                    />
                    <span>Signed to Team Roster</span>
                  </label>
                </div>
              </div>

              {/* Stats SNAP Row */}
              <div className="border-t border-gaming-gray/40 pt-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">UR Season Stats Snapshot</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-600 uppercase">UR K/D Ratio (0-15)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="15"
                      value={kdRatio}
                      onChange={(e) => setKdRatio(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-600 uppercase">UR Headshot %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={headshotPct}
                      onChange={(e) => setHeadshotPct(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-600 uppercase">UR Win Rate %</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={winRate}
                      onChange={(e) => setWinRate(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-600 uppercase">UR Matches</label>
                    <input
                      type="number"
                      min="0"
                      value={matchesPlayed}
                      onChange={(e) => setMatchesPlayed(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Block: Setup Specs */}
            <div className="bg-[#0d0e12] border border-gaming-gray rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-digital-yellow" /> Gear & Controls
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gaming Device</label>
                <input
                  type="text"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Control Configuration</label>
                <input
                  type="text"
                  value={controlSetup}
                  onChange={(e) => setControlSetup(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bio Narrative</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition resize-none leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Social Links Form Section */}
          <div className="bg-[#0d0e12] border border-gaming-gray rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-2 flex items-center gap-1.5">
              📱 Social Links & Contact Channels
            </h3>
            <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
              Log recruitment contact paths so team scouts can reach out to you directly. Empty fields will not be displayed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Twitter / X Handle</label>
                <input
                  type="text"
                  placeholder="e.g. twitter.com/username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discord Tag</label>
                <input
                  type="text"
                  placeholder="e.g. username#0000 or username"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Instagram Link</label>
                <input
                  type="text"
                  placeholder="e.g. instagram.com/username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Facebook Link</label>
                <input
                  type="text"
                  placeholder="e.g. facebook.com/username"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Block: Add Placement (Trophy) */}
          <div className="bg-[#0d0e12] border border-gaming-gray rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-2 flex items-center gap-1.5">
              🏆 Log New Tournament Trophy
            </h3>
            <p className="text-xs text-gray-500 -mt-1 leading-relaxed">
              Fill these fields if you want to append a new tournament placement record to your profile. Left empty, no trophies will be added.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tournament Name</label>
                <input
                  type="text"
                  placeholder="e.g. PMSL SEA Spring"
                  value={trophyName}
                  onChange={(e) => setTrophyName(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Placement (Number)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  value={trophyPlacement}
                  onChange={(e) => setTrophyPlacement(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Team Represented</label>
                <input
                  type="text"
                  placeholder="e.g. Viper Clan"
                  value={trophyTeam}
                  onChange={(e) => setTrophyTeam(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Date (YYYY-MM)</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-06"
                  value={trophyDate}
                  onChange={(e) => setTrophyDate(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action block */}
          <div className="flex justify-end gap-3 border-t border-gaming-gray pt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition shadow-md shadow-amber-950/20"
            >
              {saving ? "Saving Changes..." : "Save Portfolio Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
