"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";

interface AdminPlayersClientProps {
  adminId: string;
  adminIgn: string;
  adminEmail: string;
}

interface PlayerData {
  id?: string;
  email: string;
  password?: string;
  ign: string;
  characterId: string;
  region: string;
  bio: string;
  role: string;
  device: string;
  controlSetup: string;
  kdRatio: number | string;
  headshotPct: number | string;
  winRate: number | string;
  matchesPlayed: number | string;
  urRank: string;
  urPoints: number | string;
  competitiveExperience: number | string;
  officialTournaments: number | string;
  underContract: boolean;
  contractStartDate: string;
  contractEndDate: string;
}

const emptyForm: PlayerData = {
  email: "",
  password: "",
  ign: "",
  characterId: "",
  region: "Southeast Asia",
  bio: "",
  role: "Fragger",
  device: "iPhone 15 Pro Max",
  controlSetup: "4-Finger Claw",
  kdRatio: "",
  headshotPct: "",
  winRate: "",
  matchesPlayed: "",
  urRank: "Vanguard",
  urPoints: "",
  competitiveExperience: 1,
  officialTournaments: 0,
  underContract: false,
  contractStartDate: "",
  contractEndDate: "",
};

export default function AdminPlayersClient({ adminId, adminIgn, adminEmail }: AdminPlayersClientProps) {
  const [formData, setFormData] = useState<PlayerData>(emptyForm);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const executeSearch = async (val: string) => {
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/players?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPlayer = (player: any) => {
    setFormData({
      id: player.id,
      email: player.email,
      ign: player.ign,
      characterId: player.characterId || "",
      region: player.region || "Southeast Asia",
      bio: player.bio || "",
      role: player.role || "Fragger",
      device: player.device || "iPhone 15 Pro Max",
      controlSetup: player.controlSetup || "4-Finger Claw",
      kdRatio: player.kdRatio ?? "",
      headshotPct: player.headshotPct ?? "",
      winRate: player.winRate ?? "",
      matchesPlayed: player.matchesPlayed ?? "",
      urRank: player.urRank || "Vanguard",
      urPoints: player.urPoints ?? "",
      competitiveExperience: player.competitiveExperience ?? 1,
      officialTournaments: player.officialTournaments ?? 0,
      underContract: player.underContract ?? false,
      contractStartDate: player.contractStartDate ? new Date(player.contractStartDate).toISOString().split("T")[0] : "",
      contractEndDate: player.contractEndDate ? new Date(player.contractEndDate).toISOString().split("T")[0] : "",
    });
    setIsEditMode(true);
    setSearchResults([]);
    setSearchQuery("");
    setSuccessMsg(`Loaded stats for player "${player.ign}". You are now in edit mode.`);
    setErrorMsg("");
  };

  const handleResetForm = () => {
    setFormData(emptyForm);
    setIsEditMode(false);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        region: value === "Coach" ? "Southeast Asia" : "South Asia"
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const endpoint = "/api/admin/players";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          isEditMode
            ? `Success: Player "${formData.ign}" has been successfully updated!`
            : `Success: Player "${formData.ign}" has been successfully onboarded and added!`
        );
        if (!isEditMode) {
          setFormData(emptyForm);
        }
      } else {
        setErrorMsg(data.error || "Failed to process player configuration");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error: Failed to connect to server.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gaming-black">
      {/* Top Navbar */}
      <Navbar isLoggedIn={true} playerIgn={adminIgn} playerId={adminId} />

      {/* Admin Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Title Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-airdrop-red/10 to-transparent border border-airdrop-red/30 rounded-3xl p-6 md:p-8 mb-8">
          <div className="absolute top-0 right-0 w-24 h-24 bg-airdrop-red/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🛠️</span>
            <span className="text-[10px] text-airdrop-red font-black uppercase tracking-widest bg-airdrop-red/10 px-2.5 py-0.5 rounded border border-airdrop-red/20">
              Admin Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
            Player Onboarding & Stats Editor
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 max-w-xl">
            Create brand new player accounts with custom stats, or search for existing profiles to modify their parameters, playstyles, contract details, and leaderboard values.
          </p>
        </div>

        {/* Sub-navigation Header */}
        <div className="flex gap-4 border-b border-gaming-gray pb-4 mb-8">
          <Link
            href="/admin/moderation"
            className="text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-gaming-gray/20 border border-gaming-gray/30 text-gray-400 hover:text-white rounded-lg transition"
          >
            🛡️ Moderation Center
          </Link>
          <Link
            href="/admin/players"
            className="text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-airdrop-red/10 border border-airdrop-red text-airdrop-red rounded-lg transition"
          >
            👥 Manage Players
          </Link>
        </div>

        {/* Search Existing Player block */}
        <div className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-6 mb-8 relative overflow-hidden">
          <h2 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2 mb-3">
            <span className="w-1.5 h-3 bg-digital-yellow" /> Load Player profile to Edit
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                executeSearch(e.target.value);
              }}
              placeholder="Search by IGN or email address..."
              className="flex-1 min-h-[48px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-500 focus:outline-none transition"
            />
          </div>

          {/* Search Results list */}
          {searchResults.length > 0 && (
            <div className="mt-4 border-t border-gaming-gray/40 pt-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlayer(p)}
                  className="bg-gaming-black/60 hover:bg-gaming-gray/40 border border-gaming-gray/50 rounded-xl p-3 flex justify-between items-center cursor-pointer transition"
                >
                  <div className="text-left">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">{p.ign}</h4>
                    <p className="text-[9px] text-gray-500 font-mono">{p.email}</p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-digital-yellow/10 border border-digital-yellow/30 text-digital-yellow rounded-lg">
                    Select Profile
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-4 bg-airdrop-red/10 border border-airdrop-red/30 rounded-2xl text-xs font-bold text-airdrop-red uppercase tracking-wider mb-6">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-xs font-bold text-green-400 uppercase tracking-wider mb-6">
            ✅ {successMsg}
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center border-b border-gaming-gray/60 pb-4 mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {isEditMode ? `EDITING PROFILE: ${formData.ign}` : "ONBOARD NEW PLAYER CARD"}
            </h3>
            {isEditMode && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-gaming-gray hover:bg-gray-800 border border-gaming-gray hover:border-gray-500 text-gray-300 rounded-lg transition cursor-pointer"
              >
                Clear / Create New Mode
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Credentials */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-digital-yellow uppercase tracking-wider border-l-2 border-digital-yellow pl-2">
                Account Details
              </h4>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">IGN</label>
                <input
                  type="text"
                  name="ign"
                  value={formData.ign}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Paraboy"
                  className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. paraboy@esports.com"
                  className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password {isEditMode && <span className="text-[9px] text-gray-500 lowercase">(leave empty to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  placeholder={isEditMode ? "••••••••" : "Create password"}
                  className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Character ID</label>
                <input
                  type="text"
                  name="characterId"
                  value={formData.characterId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 5123456789"
                  className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Country / Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                >
                  {formData.role === "Coach" ? (
                    <>
                      <option value="Southeast Asia">Southeast Asia</option>
                      <option value="South Asia">South Asia</option>
                      <option value="Middle East">Middle East</option>
                      <option value="Europe">Europe</option>
                      <option value="Americas">Americas</option>
                      <option value="East Asia">East Asia</option>
                    </>
                  ) : (
                    <>
                      <option value="South Asia">South Asia</option>
                      <option value="Bangladesh 🇧🇩">Bangladesh 🇧🇩</option>
                      <option value="Nepal 🇳🇵">Nepal 🇳🇵</option>
                      <option value="Pakistan 🇵🇰">Pakistan 🇵🇰</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Biography</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Introduce the competitor..."
                  className="w-full bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl p-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Playstyle & Ratings */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-digital-yellow uppercase tracking-wider border-l-2 border-digital-yellow pl-2">
                Playstyle & Ratings
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Role Selection</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  >
                    <option value="IGL">IGL</option>
                    <option value="Entry Fragger">Entry Fragger</option>
                    <option value="Fragger">Fragger</option>
                    <option value="Assaulter">Assaulter</option>
                    <option value="Support">Support</option>
                    <option value="Sniper">Sniper</option>
                    <option value="Scout">Scout</option>
                    <option value="Coach">Coach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tier / Rank Assignment</label>
                  <select
                    name="urRank"
                    value={formData.urRank}
                    onChange={handleInputChange}
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  >
                    <option value="Legend">Tier-1 Pro (Legend)</option>
                    <option value="Peerless">Tier-2 Pro (Peerless)</option>
                    <option value="Supreme">Tier-3 Pro (Supreme)</option>
                    <option value="Exceed">Semi-Pro (Exceed)</option>
                    <option value="Vanguard">Amateur (Vanguard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Device</label>
                  <input
                    type="text"
                    name="device"
                    value={formData.device}
                    onChange={handleInputChange}
                    placeholder="iPad Pro / iPhone 15"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Control Layout</label>
                  <input
                    type="text"
                    name="controlSetup"
                    value={formData.controlSetup}
                    onChange={handleInputChange}
                    placeholder="4-Finger Claw, Gyro"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">K/D Ratio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="kdRatio"
                    value={formData.kdRatio}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Headshot %</label>
                  <input
                    type="number"
                    step="0.1"
                    name="headshotPct"
                    value={formData.headshotPct}
                    onChange={handleInputChange}
                    required
                    placeholder="0.0"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Win Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    name="winRate"
                    value={formData.winRate}
                    onChange={handleInputChange}
                    required
                    placeholder="0.0"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Matches Played</label>
                  <input
                    type="number"
                    name="matchesPlayed"
                    value={formData.matchesPlayed}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Leaderboard Points</label>
                  <input
                    type="number"
                    name="urPoints"
                    value={formData.urPoints}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Competitive Experience (Years)</label>
                  <input
                    type="number"
                    name="competitiveExperience"
                    value={formData.competitiveExperience}
                    onChange={handleInputChange}
                    required
                    placeholder="1"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Official Tour Played</label>
                  <input
                    type="number"
                    name="officialTournaments"
                    value={formData.officialTournaments}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contract Timeline */}
          <div className="mt-8 pt-6 border-t border-gaming-gray/60">
            <h4 className="text-xs font-bold text-digital-yellow uppercase tracking-wider border-l-2 border-digital-yellow pl-2 mb-4">
              Contract Timeline
            </h4>
            
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="underContract"
                name="underContract"
                checked={formData.underContract}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gaming-gray bg-gaming-black text-digital-yellow focus:ring-digital-yellow cursor-pointer"
              />
              <label htmlFor="underContract" className="text-xs font-extrabold text-white uppercase tracking-wider cursor-pointer">
                Under Active Esports Organization Contract
              </label>
            </div>

            {formData.underContract && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contract Start Date</label>
                  <input
                    type="date"
                    name="contractStartDate"
                    value={formData.contractStartDate}
                    onChange={handleInputChange}
                    required={formData.underContract}
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contract End Date</label>
                  <input
                    type="date"
                    name="contractEndDate"
                    value={formData.contractEndDate}
                    onChange={handleInputChange}
                    required={formData.underContract}
                    className="w-full min-h-[44px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide focus:outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Action buttons */}
          <div className="mt-8 pt-6 border-t border-gaming-gray/60 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleResetForm}
              className="bg-gaming-gray/60 hover:bg-gaming-gray text-gray-300 hover:text-white border border-gaming-gray hover:border-gray-500 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer"
            >
              Cancel / Reset
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-airdrop-red hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
            >
              {submitLoading ? "Saving Competitor..." : isEditMode ? "Update Player Entry" : "Onboard Player Entry"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
