"use client";

import { useState, useRef } from "react";
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
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  discord: string | null;
  teamHistory: string | null;
  achievements: string | null;
  highestTier: string;
  profileType?: string;
  coachingYears?: number;
  coachingHistory?: string | null;
  specialties?: string | null;
  underContract?: boolean;
  contractStartDate?: Date | string | null;
  contractEndDate?: Date | string | null;
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
  const [discord, setDiscord] = useState(player.discord || "");
  const [profileType, setProfileType] = useState(player.profileType || "Player");
  const [coachingYears, setCoachingYears] = useState(player.coachingYears?.toString() || "0");
  const [coachingHistory, setCoachingHistory] = useState(player.coachingHistory || "");
  const [specialties, setSpecialties] = useState<string[]>(player.specialties ? player.specialties.split(",") : []);
  const [characterId, setCharacterId] = useState(player.characterId);
  const [avatarUrl, setAvatarUrl] = useState(player.avatarUrl || "");
  const [role, setRole] = useState(player.role);
  const [region, setRegion] = useState(player.region);
  const [highestTier, setHighestTier] = useState(player.highestTier || "None");

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().substring(0, 10);
    } catch (e) {
      return "";
    }
  };

  const [underContract, setUnderContract] = useState(player.underContract || false);
  const [contractStartDate, setContractStartDate] = useState(formatDateString(player.contractStartDate));
  const [contractEndDate, setContractEndDate] = useState(formatDateString(player.contractEndDate));

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compressed WebP Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // Downscale to max dimensions of 256x256
          const MAX_SIZE = 256;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to webp with 0.75 quality compression (yielding ~15-30KB base64 string)
            const webpDataUrl = canvas.toDataURL("image/webp", 0.75);
            setAvatarUrl(webpDataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
      avatarUrl: avatarUrl || null,
      role,
      region,
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
      twitter: null,
      discord: discord || null,
      teamHistory: teamHistory || null,
      achievements: achievements || null,
      highestTier,
      profileType,
      coachingYears: parseInt(coachingYears) || 0,
      coachingHistory: coachingHistory || null,
      specialties: specialties.join(",") || null,
      underContract: underContract,
      contractStartDate: underContract && contractStartDate ? contractStartDate : null,
      contractEndDate: underContract && contractEndDate ? contractEndDate : null,
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

    // Save current values to restore in case of failure
    const originalPlayer = { ...player };

    // Update local player fields immediately for instant feedback
    player.ign = ign;
    player.characterId = characterId;
    player.status = status;
    player.avatarUrl = avatarUrl || null;
    player.role = role;
    player.region = region;
    player.kdRatio = parseFloat(kdRatio) || 0;
    player.headshotPct = parseFloat(headshotPct) || 0;
    player.winRate = parseFloat(winRate) || 0;
    player.matchesPlayed = parseInt(matchesPlayed) || 0;
    player.urRank = urRank;
    player.urPoints = parseInt(urPoints) || 0;
    player.device = device;
    player.controlSetup = controlSetup;
    player.bio = bio;
    player.facebook = facebook || null;
    player.instagram = instagram || null;
    player.discord = discord || null;
    player.teamHistory = teamHistory || null;
    player.achievements = achievements || null;
    player.highestTier = highestTier;
    player.profileType = profileType;
    player.coachingYears = parseInt(coachingYears) || 0;
    player.coachingHistory = coachingHistory || null;
    player.specialties = specialties.join(",") || null;
    player.underContract = underContract;
    player.contractStartDate = underContract && contractStartDate ? contractStartDate : null;
    player.contractEndDate = underContract && contractEndDate ? contractEndDate : null;

    setSaveSuccess("Portfolio successfully saved!");

    fetch(`/api/players/${player.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          setTrophyName("");
          setTrophyPlacement("1");
          setTrophyDate("");
          router.refresh();
          setTimeout(() => {
            setSaveSuccess("");
          }, 3000);
        } else {
          Object.assign(player, originalPlayer);
          const err = await res.json();
          alert(`Error: ${err.error || "Update failed"}`);
          setSaveSuccess("");
        }
      })
      .catch((err) => {
        Object.assign(player, originalPlayer);
        console.error(err);
        alert("Failed to update profile due to connection error.");
        setSaveSuccess("");
      })
      .finally(() => {
        setSaving(false);
      });
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
            Manage your player stats, tryout status, and visual player card.
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
              {/* Profile Type Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Type</label>
                <select
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                >
                  <option value="Player">Player</option>
                  <option value="Coach">Coach</option>
                </select>
              </div>

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

              {profileType === "Coach" ? (
                <>
                  {/* Years of Experience & Region */}
                  <div className="grid grid-cols-2 gap-4 border-t border-gaming-gray/40 pt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Years of Experience</label>
                      <select
                        value={coachingYears}
                        onChange={(e) => setCoachingYears(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      >
                        <option value="0">0 years</option>
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5+ years</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      >
                        <option value="Southeast Asia">Southeast Asia</option>
                        <option value="South Asia">South Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="North America">North America</option>
                        <option value="Middle East">Middle East</option>
                      </select>
                    </div>
                  </div>

                  {/* Teams Coached */}
                  <div className="flex flex-col gap-1 border-t border-gaming-gray/40 pt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teams Coached (comma-separated)</label>
                    <input
                      type="text"
                      value={coachingHistory}
                      onChange={(e) => setCoachingHistory(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition"
                      placeholder="e.g. Nova Esports, Alpha Team, Apex Esports"
                    />
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-col gap-1 border-t border-gaming-gray/40 pt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Core Specialties</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {["Analysis", "Tactics", "Strategy", "Training", "VOD Review", "In-Game Leading", "Macro Setup", "Scouting"].map((tag) => {
                        const isSelected = specialties.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => {
                              if (isSelected) {
                                setSpecialties(specialties.filter((s) => s !== tag));
                              } else {
                                setSpecialties([...specialties, tag]);
                              }
                            }}
                            className={`px-2 py-1.5 rounded-lg border text-[9px] font-black tracking-wider uppercase transition text-center cursor-pointer ${
                              isSelected
                                ? "bg-digital-yellow border-digital-yellow text-gaming-black"
                                : "bg-gaming-black border-gaming-gray text-gray-400 hover:border-gray-700"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Role & Country Selectors */}
                  <div className="grid grid-cols-2 gap-4 border-t border-gaming-gray/40 pt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In-Game Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      >
                        <option value="IGL">IGL</option>
                        <option value="Entry Fragger">Entry Fragger</option>
                        <option value="Support">Support</option>
                        <option value="Sniper">Sniper</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Country / Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      >
                        <option value="Southeast Asia">Southeast Asia</option>
                        <option value="South Asia">South Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="North America">North America</option>
                        <option value="Middle East">Middle East</option>
                      </select>
                    </div>
                  </div>

                  {/* Highest Official Tournament Played */}
                  <div className="flex flex-col gap-1 border-t border-gaming-gray/40 pt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Highest Official Tournament Played</label>
                    <select
                      value={highestTier}
                      onChange={(e) => setHighestTier(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                    >
                      <option value="None">None (0 rating)</option>
                      <option value="S-Tier">S-Tier - PMGC, PMWC (150 rating)</option>
                      <option value="A-Tier">A-Tier - PMPL, PMPS, PMSL, PMGO (110 rating)</option>
                      <option value="B-Tier">B-Tier - PMNC, PMCC, PMBC, PMAC (70 rating)</option>
                      <option value="C-Tier">C-Tier - Community & 3rd Party (35 rating)</option>
                    </select>
                  </div>

                  {/* Competitive Standing Tier Selector */}
                  <div className="flex flex-col gap-1 border-t border-gaming-gray/40 pt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Competitive Tier / Experience</label>
                    <select
                      value={urRank}
                      onChange={(e) => setUrRank(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition w-full"
                    >
                      <option value="Vanguard">Amateur</option>
                      <option value="Exceed">Semi-Pro</option>
                      <option value="Supreme">Tier-3 Pro</option>
                      <option value="Peerless">Tier-2 Pro</option>
                      <option value="Legend">Tier-1 Pro</option>
                    </select>
                  </div>

                  {/* Contract Management Section */}
                  <div className="flex flex-col gap-1 border-t border-gaming-gray/40 pt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contracted Status</label>
                    <select
                      value={underContract ? "yes" : "no"}
                      onChange={(e) => setUnderContract(e.target.value === "yes")}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                    >
                      <option value="no">No, I am a Free Agent / Open for Offers</option>
                      <option value="yes">Yes, I am signed/under contract with a team</option>
                    </select>
                  </div>

                  {underContract && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 animate-fade-in">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contract Start Date</label>
                        <input
                          type="date"
                          value={contractStartDate}
                          onChange={(e) => setContractStartDate(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full [color-scheme:dark]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contract End Date</label>
                        <input
                          type="date"
                          value={contractEndDate}
                          onChange={(e) => setContractEndDate(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

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
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Availability Status</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Looking For Team"}
                      onChange={() => setStatus("Looking For Team")}
                      className="accent-airdrop-red"
                    />
                    <span>Free Agent</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Signed"}
                      onChange={() => setStatus("Signed")}
                      className="accent-airdrop-red"
                    />
                    <span>Not Available</span>
                  </label>
                </div>
              </div>


            </div>

            {/* Right Block: Setup Specs */}
            <div className="bg-[#0d0e12] border border-gaming-gray rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-digital-yellow" /> Gear & Controls
              </h3>

              <div className="flex flex-col gap-3.5 border-b border-gaming-gray/30 pb-5 mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Esports Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-xl bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0 relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} className="w-full h-full object-cover" alt="Esports Preview" />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-8 h-8 text-gray-600">
                        <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                        <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-grow flex-1 items-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-digital-yellow/10 border border-digital-yellow/20 hover:bg-digital-yellow/20 text-digital-yellow font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <span className="text-[9px] text-gray-500 block pl-0.5">Supports PNG, JPEG. Converted directly to offline local asset.</span>
                  </div>
                </div>
              </div>

              {profileType !== "Coach" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gaming Device</label>
                    <input
                      type="text"
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      required={profileType !== "Coach"}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Control Configuration</label>
                    <input
                      type="text"
                      value={controlSetup}
                      onChange={(e) => setControlSetup(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      required={profileType !== "Coach"}
                    />
                  </div>
                </>
              )}

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
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discord Tag</label>
                <input
                  type="text"
                  placeholder="e.g. username#0000 or username"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-2 text-xs text-white focus:border-digital-yellow focus:outline-none"
                />
              </div>
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
              <div className="flex flex-col gap-1 sm:col-span-2">
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
