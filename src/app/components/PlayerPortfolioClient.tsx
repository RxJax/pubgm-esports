"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [showClipModal, setShowClipModal] = useState(false);
  const [newClipTitle, setNewClipTitle] = useState("");
  const [newClipUrl, setNewClipUrl] = useState("");
  const [savingClip, setSavingClip] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const getEmbedUrl = (url: string): { type: "iframe" | "unsupported"; embedUrl: string } => {
    if (!url) return { type: "unsupported", embedUrl: "" };

    const ytWatchRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const ytShortsRegex = /youtube\.com\/shorts\/([^"&?\/ ]{11})/;

    const watchMatch = url.match(ytWatchRegex);
    const shortsMatch = url.match(ytShortsRegex);

    if (watchMatch) {
      return { type: "iframe", embedUrl: `https://www.youtube.com/embed/${watchMatch[1]}` };
    }
    if (shortsMatch) {
      return { type: "iframe", embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}` };
    }

    const tiktokRegex = /tiktok\.com\/@[^\/]+\/video\/(\d+)/;
    const tiktokMatch = url.match(tiktokRegex);
    if (tiktokMatch) {
      return { type: "iframe", embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}` };
    }

    const instaRegex = /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/;
    const instaMatch = url.match(instaRegex);
    if (instaMatch) {
      return { type: "iframe", embedUrl: `https://www.instagram.com/reel/${instaMatch[1]}/embed/captioned` };
    }

    if (url.includes("/embed/")) {
      return { type: "iframe", embedUrl: url };
    }

    return { type: "unsupported", embedUrl: url };
  };

  const handleSaveClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClipTitle.trim() || !newClipUrl.trim()) {
      alert("Please enter a title and a valid link.");
      return;
    }
    setSavingClip(true);
    
    const payload = {
      newHighlight: {
        title: newClipTitle.trim(),
        videoUrl: newClipUrl.trim(),
      }
    };

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setNewClipTitle("");
        setNewClipUrl("");
        setShowClipModal(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to save clip"}`);
      }
    } catch (err) {
      console.error("Save highlight error:", err);
      alert("Failed to save clip due to network error.");
    } finally {
      setSavingClip(false);
    }
  };

  const handleExportImage = async () => {
    const card = document.getElementById("esports-player-card");
    if (!card) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(card, {
        quality: 0.95,
        pixelRatio: 2,
        filter: (node) => {
          if (node.classList?.contains("exclude-from-export")) {
            return false;
          }
          return true;
        }
      });
      const link = document.createElement("a");
      link.download = player.profileType === "Coach"
        ? `${player.ign.replace(/\s+/g, "_")}-Pro-Coach-Card.png`
        : `${player.ign.replace(/\s+/g, "_")}-Esports-Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export player card as image.");
    } finally {
      setIsExporting(false);
      setShowShareMenu(false);
    }
  };

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
  const [editTeamHistory, setEditTeamHistory] = useState(player.teamHistory || "");
  const [editAchievements, setEditAchievements] = useState(player.achievements || "");
  const [editIgn, setEditIgn] = useState(player.ign);
  const [editCharacterId, setEditCharacterId] = useState(player.characterId);

  const [editFacebook, setEditFacebook] = useState(player.facebook || "");
  const [editInstagram, setEditInstagram] = useState(player.instagram || "");
  const [editDiscord, setEditDiscord] = useState(player.discord || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(player.avatarUrl || "");
  const [editRole, setEditRole] = useState(player.role);
  const [editRegion, setEditRegion] = useState(player.region);
  const [editHighestTier, setEditHighestTier] = useState(player.highestTier || "None");

  const [editProfileType, setEditProfileType] = useState(player.profileType || "Player");
  const [editCoachingYears, setEditCoachingYears] = useState(player.coachingYears?.toString() || "0");
  const [editCoachingHistory, setEditCoachingHistory] = useState(player.coachingHistory || "");
  const [editSpecialties, setEditSpecialties] = useState<string[]>(player.specialties ? player.specialties.split(",") : []);

  // Compressed WebP Image handler for client-side upload
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
            setEditAvatarUrl(webpDataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
      ign: editIgn,
      characterId: editCharacterId,
      status: editStatus,
      avatarUrl: editAvatarUrl || null,
      role: editRole,
      region: editRegion,
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
      twitter: null,
      discord: editDiscord || null,
      teamHistory: editTeamHistory || null,
      achievements: editAchievements || null,
      highestTier: editHighestTier,
      profileType: editProfileType,
      coachingYears: parseInt(editCoachingYears) || 0,
      coachingHistory: editCoachingHistory || null,
      specialties: editSpecialties.join(",") || null,
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
  const getEsportsRating = (tier: string = player.highestTier) => {
    if (tier === "S-Tier") return 150;
    if (tier === "A-Tier") return 110;
    if (tier === "B-Tier") return 70;
    if (tier === "C-Tier") return 35;
    return 0;
  };

  const getEsportsRatingDetails = (tier: string = player.highestTier) => {
    if (tier === "S-Tier") return "S-Tier (PMGC, PMWC)";
    if (tier === "A-Tier") return "A-Tier (PMPL, PMPS, PMSL, PMGO)";
    if (tier === "B-Tier") return "B-Tier (PMNC, PMCC, PMBC, PMAC)";
    if (tier === "C-Tier") return "C-Tier (Community & 3rd Party)";
    return "No Placements Registered";
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
      <div id="esports-player-card" className="max-w-5xl mx-auto bg-gaming-black border-2 border-gaming-gray rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(255,189,3,0.06)] mb-8">
        <div className="relative bg-gradient-to-r from-gaming-gray via-gaming-black to-[#050608] p-6 md:p-10 border-b-2 border-gaming-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Cybernetic grid bg */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Left Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Team Logo Avatar */}
            <div className="relative w-24 h-24 rounded-2xl bg-gaming-black border-2 border-gaming-gray flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-digital-yellow/10 to-transparent pointer-events-none" />
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.ign} className="w-full h-full object-cover" />
              ) : player.team?.logoUrl ? (
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
                      ? "bg-airdrop-red/10 text-airdrop-red border-airdrop-red/30"
                      : "bg-green-500/10 text-green-400 border-green-500/20 animate-pulse"
                  }`}
                >
                  {player.status === "Signed" ? "Not Available" : "Free Agent"}
                </span>
                <span className="bg-gaming-gray text-gray-300 text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded border border-gray-700">
                  {player.profileType === "Coach" ? "PRO COACH" : player.role}
                </span>
                <span className="bg-gaming-gray text-gray-300 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded border border-gray-700">
                  {player.region}
                </span>
                {player.profileType === "Coach" && (
                  <span className="bg-digital-yellow/10 border border-digital-yellow/30 text-digital-yellow text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded">
                    👑 {player.coachingYears} Years Exp
                  </span>
                )}
              </div>

              {/* IGN */}
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-3">
                {player.ign}
              </h1>
              <p className="text-gray-500 text-xs mt-1 font-mono">UID: {player.characterId}</p>

              {/* Specialties horizontal flex wrap */}
              {player.profileType === "Coach" && player.specialties && (
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                  {player.specialties.split(",").map((tag) => (
                    <span key={tag} className="bg-gaming-gray/80 border border-gaming-gray text-gray-300 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      🎯 {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              <p className="text-gray-300 text-sm mt-3 max-w-xl leading-relaxed italic">
                &ldquo;{player.bio}&ldquo;
              </p>

              {/* Recruitment Contacts panel */}
              {(player.discord || player.instagram || player.facebook) && (
                <div className="flex flex-wrap gap-2.5 mt-4 relative z-25">
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
            {/* Status box */}
            <div className={`${player.status === "Looking For Team" || player.status === "Free Agent" ? "bg-green-500/5 border-green-500/20" : "bg-airdrop-red/5 border-airdrop-red/20"} border p-4 rounded-xl text-center`}>
              <div className={`text-[9px] ${player.status === "Looking For Team" || player.status === "Free Agent" ? "text-green-400" : "text-airdrop-red"} font-black uppercase tracking-wider mb-1`}>Status</div>
              <div className={`text-sm font-black ${player.status === "Looking For Team" || player.status === "Free Agent" ? "text-green-500" : "text-airdrop-red"} uppercase tracking-wider`}>
                {player.status === "Looking For Team" || player.status === "Free Agent" ? "Free Agent" : "Not Available"}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {player.status === "Looking For Team" || player.status === "Free Agent" ? "Available for active tryouts" : "Contracted to active roster"}
              </div>
            </div>

            {/* Teammates box if signed */}
            {player.team && (
              <div className="bg-gaming-black/90 border border-gaming-gray p-4 rounded-xl flex flex-col gap-2 shadow-inner">
                <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Teammates</div>
                <div className="flex items-center gap-2">
                  <img src={player.team.logoUrl || ""} className="w-4 h-4 rounded-full object-cover" alt="" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{player.team.name}</span>
                </div>
                <button
                  onClick={() => setShowRosterModal(true)}
                  className="mt-2 w-full text-center text-xs font-black text-digital-yellow hover:text-white border border-digital-yellow/30 hover:border-digital-yellow bg-digital-yellow/5 py-1.5 rounded-lg transition"
                >
                  View Team Roster
                </button>
              </div>
            )}
          </div>

          {/* Export / Share Button */}
          <div className="absolute right-4 bottom-4 z-20 exclude-from-export">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShareMenu(!showShareMenu)}
                disabled={isExporting}
                className="bg-gaming-black/80 hover:bg-gaming-black border border-gaming-gray hover:border-digital-yellow text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-2.5 h-2.5 border-2 border-digital-yellow border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <span>📤</span> Export / Share
                  </>
                )}
              </button>

              {showShareMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-52 bg-[#0d0e12] border-2 border-gaming-gray rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
                  <button
                    type="button"
                    onClick={handleExportImage}
                    className="w-full text-left px-4 py-3 min-h-[48px] text-[10.5px] font-black uppercase text-gray-300 hover:text-white hover:bg-gaming-gray/30 transition flex items-center gap-2.5 border-b border-gaming-gray/40 cursor-pointer"
                  >
                    <span>💾</span> Save as Image
                  </button>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareMenu(false)}
                    className="w-full text-left px-4 py-3 min-h-[48px] text-[10.5px] font-black uppercase text-gray-300 hover:text-white hover:bg-gaming-gray/30 transition flex items-center gap-2.5 border-b border-gaming-gray/40 flex"
                  >
                    <span>👥</span> Share on Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Profile link copied! Paste it in your Instagram story or bio.");
                      }
                      setShowShareMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 min-h-[48px] text-[10.5px] font-black uppercase text-gray-300 hover:text-white hover:bg-gaming-gray/30 transition flex items-center gap-2.5 border-b border-gaming-gray/40 flex"
                  >
                    <span>📸</span> Share on Instagram
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Esports Profile Link Copied!");
                      }
                      setShowShareMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 min-h-[48px] text-[10.5px] font-black uppercase text-gray-300 hover:text-white hover:bg-gaming-gray/30 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span>🔗</span> Copy Profile Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gaming-gray bg-gaming-gray/20 overflow-x-auto whitespace-nowrap scrollbar-none exclude-from-export">
          {[
            { id: "stats", label: "COMPETITIVE STANDING" },
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
          {(activeTab === "stats" || isExporting) && (
            player.profileType === "Coach" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Stats Block */}
                <div className="md:col-span-2 bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-6">
                  <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-digital-yellow" /> COACHING PORTFOLIO
                  </h3>

                  {/* Coaching Years of Experience */}
                  <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray font-mono text-xs">
                    <span className="text-gray-500 block uppercase font-black text-[9px] mb-1">Coaching Experience</span>
                    <span className="text-digital-yellow font-black text-sm">👑 {player.coachingYears} Years of Esports Coaching</span>
                  </div>

                  {/* Specialties List */}
                  {player.specialties && (
                    <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray font-mono text-xs">
                      <span className="text-gray-500 block uppercase font-black text-[9px] mb-2">Core Coaching Specialties</span>
                      <div className="flex flex-wrap gap-2">
                        {player.specialties.split(",").map(tag => (
                          <span key={tag} className="bg-digital-yellow/10 border border-digital-yellow/20 text-digital-yellow text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded">
                            🎯 {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teams Coached structured list */}
                  {player.coachingHistory && (
                    <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray font-mono text-xs">
                      <span className="text-gray-500 block uppercase font-black text-[9px] mb-2">Teams Coached History</span>
                      <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gaming-gray">
                        {player.coachingHistory.split(",").map((team, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-gaming-gray/30 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-300 font-bold uppercase tracking-wider">{team.trim()}</span>
                            <span className="text-[10px] text-gray-500 font-black">FORMER ORG / TEAM</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ranks Block */}
                <div className="bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-digital-yellow" /> Roster Standing
                  </h3>

                  <div className="flex flex-col gap-5">
                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Profile Category</span>
                      <div className="text-base font-black text-digital-yellow uppercase mt-1">
                        🏆 Professional Coach
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Region</span>
                      <div className="text-base font-black text-white uppercase mt-1">
                        📍 {player.region}
                      </div>
                    </div>

                    {player.achievements && (
                      <div>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Achievements</span>
                        <div className="text-xs text-gray-300 mt-1 font-mono leading-relaxed">
                          🏆 {player.achievements}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Block */}
                <div className="md:col-span-2 bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-6">
                  <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-digital-yellow" /> COMPETITIVE PORTFOLIO
                  </h3>

                  {/* Competitive Portfolio Block */}
                  {(player.teamHistory || player.achievements) && (
                    <div className="bg-gaming-black p-4 rounded-xl border border-gaming-gray flex flex-col gap-3 font-mono text-xs">
                      {player.teamHistory && (
                        <div>
                          <span className="text-gray-500 block uppercase font-black text-[9px] mb-1">Competitive Team History / Former Orgs</span>
                          <span className="text-gray-300 font-semibold">{player.teamHistory}</span>
                        </div>
                      )}
                      {player.achievements && (
                        <div>
                          <span className="text-gray-500 block uppercase font-black text-[9px] mb-1">Tournament Achievements</span>
                          <span className="text-digital-yellow font-bold">🏆 {player.achievements}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ranks Block */}
                <div className="bg-gaming-black/60 border border-gaming-gray p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest border-b border-gaming-gray pb-3 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-digital-yellow" /> Roster Standing
                  </h3>

                  <div className="flex flex-col gap-5">
                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Tournament Tier</span>
                      <div className="text-base font-black text-digital-yellow uppercase mt-1">
                        👑 {player.urRank === "Legend" ? "Tier-1 Pro" : player.urRank === "Peerless" ? "Tier-2 Pro" : player.urRank === "Supreme" ? "Tier-3 Pro" : player.urRank === "Exceed" ? "Semi-Pro" : "Amateur"}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider">Esports Rating</span>
                      <div className="text-2xl font-black text-airdrop-red mt-1">
                        {getEsportsRating()} <span className="text-xs text-gray-500 font-normal">/ 150</span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 mt-1 font-mono uppercase tracking-wide">
                        Based on: {getEsportsRatingDetails()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB: Control Setup */}
          {activeTab === "setup" && !isExporting && (
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
          {activeTab === "trophies" && !isExporting && (
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
          {activeTab === "highlights" && !isExporting && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gaming-gray pb-3">
                <h3 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-digital-yellow" /> Video Showcase Reels
                </h3>
                {isOwner && player.highlights.length > 0 && (
                  <button
                    onClick={() => setShowClipModal(true)}
                    className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    + Add Clip
                  </button>
                )}
              </div>

              {player.highlights.length === 0 ? (
                <div className="bg-gaming-black/30 border border-gaming-gray rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4 text-gray-500 text-xs">
                  <span>No showcase clips recorded.</span>
                  {isOwner && (
                    <button
                      onClick={() => setShowClipModal(true)}
                      className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition shadow-lg shadow-amber-950/20 cursor-pointer"
                    >
                      Add Highlight Clip
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {player.highlights.map((hl) => {
                    const embed = getEmbedUrl(hl.url);
                    return (
                      <div key={hl.id} className="flex flex-col gap-2">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gaming-gray bg-black shadow-lg">
                          {embed.type === "iframe" ? (
                            <iframe
                              src={embed.embedUrl}
                              title={hl.title}
                              className="absolute inset-0 w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-gray-500 gap-2">
                              <span>Unsupported embed link format.</span>
                              <a
                                href={hl.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-digital-yellow font-bold underline hover:text-white"
                              >
                                Open Video Directly ↗
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="font-black text-xs text-gray-300 px-1">{hl.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Secure Edit Dashboard */}
          {activeTab === "edit" && isOwner && !isExporting && (
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
                        <span>Free Agent</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="edit-status"
                          checked={editStatus === "Signed"}
                          onChange={() => setEditStatus("Signed")}
                          className="accent-airdrop-red"
                        />
                        <span>Not Available</span>
                      </label>
                    </div>
                  </div>

                  {/* IGN & UID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In-Game Name (IGN)</label>
                      <input
                        type="text"
                        value={editIgn}
                        onChange={(e) => setEditIgn(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UID (In-Game ID)</label>
                      <input
                        type="text"
                        value={editCharacterId}
                        onChange={(e) => setEditCharacterId(e.target.value)}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Profile Type Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Type</label>
                    <select
                      value={editProfileType}
                      onChange={(e) => setEditProfileType(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                    >
                      <option value="Player">Player</option>
                      <option value="Coach">Coach</option>
                    </select>
                  </div>

                  {editProfileType === "Coach" ? (
                    <>
                      {/* Years of Experience & Region */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Years of Experience</label>
                          <select
                            value={editCoachingYears}
                            onChange={(e) => setEditCoachingYears(e.target.value)}
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
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
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
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teams Coached (comma-separated)</label>
                        <input
                          type="text"
                          value={editCoachingHistory}
                          onChange={(e) => setEditCoachingHistory(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition"
                          placeholder="e.g. Nova Esports, Alpha Team, Apex Esports"
                        />
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Core Specialties</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {["Analysis", "Tactics", "Strategy", "Training", "VOD Review", "In-Game Leading", "Macro Setup", "Scouting"].map((tag) => {
                            const isSelected = editSpecialties.includes(tag);
                            return (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => {
                                  if (isSelected) {
                                    setEditSpecialties(editSpecialties.filter((s) => s !== tag));
                                  } else {
                                    setEditSpecialties([...editSpecialties, tag]);
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In-Game Role</label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
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
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
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
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Highest Official Tournament Played</label>
                        <select
                          value={editHighestTier}
                          onChange={(e) => setEditHighestTier(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                        >
                          <option value="None">None (0 rating)</option>
                          <option value="S-Tier">S-Tier - PMGC, PMWC (150 rating)</option>
                          <option value="A-Tier">A-Tier - PMPL, PMPS, PMSL, PMGO (110 rating)</option>
                          <option value="B-Tier">B-Tier - PMNC, PMCC, PMBC, PMAC (70 rating)</option>
                          <option value="C-Tier">C-Tier - Community & 3rd Party (35 rating)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tournament Tier</label>
                        <select
                          value={editUrRank}
                          onChange={(e) => setEditUrRank(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition w-full"
                        >
                          <option value="Vanguard">Amateur</option>
                          <option value="Exceed">Semi-Pro</option>
                          <option value="Supreme">Tier-3 Pro</option>
                          <option value="Peerless">Tier-2 Pro</option>
                          <option value="Legend">Tier-1 Pro</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-4 border-t border-gaming-gray/30 pt-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Competitive Team History / Former Orgs</label>
                      <input
                        type="text"
                        value={editTeamHistory}
                        onChange={(e) => setEditTeamHistory(e.target.value)}
                        placeholder="e.g. Nova Esports, Alpha Team, Free Agent"
                        className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tournament Achievements & Highlights</label>
                      <textarea
                        value={editAchievements}
                        onChange={(e) => setEditAchievements(e.target.value)}
                        placeholder="e.g. 1st Place PMCO 2025, MVP PMSL Season 2"
                        rows={2}
                        className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Col 2: Settings & Bio */}
                <div className="flex flex-col gap-4 bg-gaming-black p-5 rounded-2xl border border-gaming-gray">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Setup & Bio</h4>

                  <div className="flex flex-col gap-2 border-b border-gaming-gray/30 pb-3 mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Esports Profile Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-15 rounded-lg bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0 relative">
                        {editAvatarUrl ? (
                          <img src={editAvatarUrl} className="w-full h-full object-cover" alt="Esports Preview" />
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-6 h-6 text-gray-600">
                            <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                            <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1 items-start">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="bg-digital-yellow/10 border border-digital-yellow/20 hover:bg-digital-yellow/20 text-digital-yellow font-black px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer"
                        >
                          Choose File
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {editProfileType !== "Coach" && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gaming Device</label>
                        <input
                          type="text"
                          value={editDevice}
                          onChange={(e) => setEditDevice(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                          required={editProfileType !== "Coach"}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Control Setup</label>
                        <input
                          type="text"
                          value={editSetup}
                          onChange={(e) => setEditSetup(e.target.value)}
                          className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none transition"
                          required={editProfileType !== "Coach"}
                        />
                      </div>
                    </>
                  )}

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
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discord tag</label>
                    <input
                      type="text"
                      value={editDiscord}
                      onChange={(e) => setEditDiscord(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Instagram link</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-3 py-1.5 text-xs text-white focus:border-digital-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
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

      {/* Add Highlight Clip Modal */}
      {showClipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-gaming-black border-2 border-gaming-gray w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gaming-gray bg-gaming-gray/20">
              <h3 className="font-black text-xs text-white uppercase tracking-widest">Add Highlight Clip</h3>
              <button onClick={() => setShowClipModal(false)} className="text-gray-400 hover:text-white transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveClip}>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Clip Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1v4 Squad Wipe - PMGC Finals"
                    value={newClipTitle}
                    onChange={(e) => setNewClipTitle(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Video Link (YouTube, TikTok, or Instagram Reels)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newClipUrl}
                    onChange={(e) => setNewClipUrl(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition w-full"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gaming-gray bg-gaming-gray/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClipModal(false)}
                  className="bg-gaming-gray hover:bg-gray-800 text-gray-200 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingClip}
                  className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  {savingClip ? "Saving..." : "Save Clip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
