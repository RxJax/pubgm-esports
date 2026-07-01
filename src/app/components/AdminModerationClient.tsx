"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";

interface PlayerSummary {
  id: string;
  ign: string;
  characterId: string;
  avatarUrl: string | null;
  role: string;
  region: string;
  isVerified: boolean;
}

interface Report {
  id: string;
  reporterId: string | null;
  reportedProfileId: string;
  reasonCategory: string;
  additionalDetails: string;
  status: string;
  createdAt: Date | string;
  reportedPlayer: PlayerSummary;
}

interface AdminModerationClientProps {
  initialReports: Report[];
  adminId: string;
  adminIgn: string;
  adminEmail: string;
}

export default function AdminModerationClient({ initialReports, adminId, adminIgn, adminEmail }: AdminModerationClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Direct Player Verification Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; ign: string; email: string; avatarUrl: string | null; status: string; isVerified: boolean }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleToggleVerification = async (playerId: string, currentStatus: boolean) => {
    setActionLoading(`verify-${playerId}`);
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });

      if (res.ok) {
        const nextStatus = !currentStatus;
        // Update search results list
        setSearchResults((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, isVerified: nextStatus } : p))
        );
        // Synchronize with pending reports Accused Players list
        setReports((prev) =>
          prev.map((r) =>
            r.reportedPlayer.id === playerId
              ? { ...r, reportedPlayer: { ...r.reportedPlayer, isVerified: nextStatus } }
              : r
          )
        );
        alert(
          nextStatus
            ? "Success: Verification badge successfully granted to the player card!"
            : "Success: Verification badge successfully revoked from the player card!"
        );
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to toggle verification"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to toggle verification.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to dismiss report"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to dismiss report.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async (reportId: string, playerId: string, playerIgn: string) => {
    const confirmed = confirm(
      `⚠️ WARNING: Are you absolutely sure you want to permanently delete the profile card of "${playerIgn}"?\n\nThis cascading query will completely purge all their data, stats, achievements, highlight clips, and reports from the database.`
    );
    if (!confirmed) return;

    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.reportedProfileId !== playerId));
        alert(`Account "${playerIgn}" was successfully deleted from the database.`);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to delete account"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to delete account.");
    } finally {
      setActionLoading(null);
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
            Reports & Moderation center
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 max-w-xl">
            Review incoming fake account flags, impersonation claims, and profile violations submitted by community members. Exercise platform removal authority when required.
          </p>
        </div>

        {/* Admin Player Search Panel (Master Admin Only) */}
        {adminEmail?.toLowerCase() === "rxjax007@gmail.com" && (
          <div className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-digital-yellow/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2 mb-3">
              <span className="w-1.5 h-3 bg-digital-yellow" /> Direct Player Verification Search
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              Search all registered players by IGN or email address to instantly grant or revoke their glowing Facebook-style blue tick verification badges.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  executeSearch(e.target.value);
                }}
                placeholder="Enter IGN or email..."
                className="flex-1 min-h-[48px] bg-gaming-black border border-gaming-gray focus:border-digital-yellow rounded-xl px-4 text-xs font-semibold text-white tracking-wide placeholder-gray-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => executeSearch(searchQuery)}
                className="bg-digital-yellow hover:bg-amber-400 text-gaming-black text-xs font-black px-6 rounded-xl uppercase tracking-widest transition cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Compact Search Results List */}
            {searchResults.length > 0 && (
              <div className="mt-6 border-t border-gaming-gray/50 pt-5 flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Search Results ({searchResults.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      className="bg-gaming-black/80 border border-gaming-gray/60 rounded-2xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                              <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                              <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                            </svg>
                          )}
                        </div>
                        <div className="truncate text-left">
                          <div className="flex items-center gap-1.5 justify-start">
                            <h4 className="font-extrabold text-white text-xs uppercase tracking-wide truncate">
                              {p.ign}
                            </h4>
                            {p.isVerified && (
                              <span className="inline-flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#1877F2] text-white shrink-0">
                                <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-500 font-mono truncate">{p.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleVerification(p.id, p.isVerified)}
                        disabled={actionLoading === `verify-${p.id}`}
                        className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-lg border transition cursor-pointer shrink-0 ${
                          p.isVerified
                            ? "bg-airdrop-red/10 border-airdrop-red/30 hover:border-airdrop-red text-airdrop-red hover:bg-airdrop-red/20"
                            : "bg-[#1877F2]/10 border-[#1877F2]/30 hover:border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/20"
                        }`}
                      >
                        {p.isVerified ? "Revoke Blue Tick" : "Grant Blue Tick"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searchLoading && (
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-4">
                No users found matching "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Reports Section */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-gaming-gray pb-4">
            <h2 className="text-xs font-black text-digital-yellow uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-3 bg-digital-yellow" /> Active Pending Reports ({reports.length})
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
              <span className="text-3xl">✅</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Pending Reports</h3>
              <p className="text-gray-500 text-xs max-w-xs">
                All community flags have been successfully resolved or dismissed. Great job keeping the community clean!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-[#0d0e12] border border-gaming-gray hover:border-airdrop-red/30 rounded-3xl p-6 transition-all duration-150 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-airdrop-red/60" />

                  {/* Left Column: Accused profile & Report info */}
                  <div className="flex-1 flex flex-col md:flex-row gap-5 items-start">
                    
                    {/* Accused Player Card Frame */}
                    <Link
                      href={`/players/${report.reportedPlayer.id}`}
                      className="group shrink-0 flex items-center gap-3 p-3 bg-gaming-black/60 border border-gaming-gray/80 rounded-2xl hover:border-digital-yellow/40 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
                        {report.reportedPlayer.avatarUrl ? (
                          <img src={report.reportedPlayer.avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                            <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                            <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                          </svg>
                        )}
                      </div>
                      <div className="max-w-[150px] truncate">
                        <h4 className="font-extrabold text-white text-xs uppercase tracking-wide group-hover:text-digital-yellow transition truncate">
                          {report.reportedPlayer.ign}
                        </h4>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">
                          UID: {report.reportedPlayer.characterId}
                        </p>
                      </div>
                    </Link>

                    {/* Report Specific Details */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-airdrop-red/10 text-airdrop-red border border-airdrop-red/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded">
                          {report.reasonCategory}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">
                          Filed: {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="bg-[#0b0c10] border border-gaming-gray/40 p-3.5 rounded-xl text-xs text-gray-300 font-medium">
                        <span className="text-[8px] text-gray-500 font-bold block uppercase mb-1">Community Evidence Submitted</span>
                        &ldquo;{report.additionalDetails || "No text description details provided."}&rdquo;
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Moderator Action Buttons */}
                  <div className="shrink-0 flex sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
                    {adminEmail?.toLowerCase() === "rxjax007@gmail.com" && (
                      <button
                        onClick={() => handleToggleVerification(report.reportedPlayer.id, report.reportedPlayer.isVerified)}
                        disabled={actionLoading !== null || report.reportedPlayer.isVerified}
                        className={`flex-1 md:flex-initial border text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-75 ${
                          report.reportedPlayer.isVerified
                            ? "bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2] cursor-default"
                            : "bg-[#1877F2]/20 hover:bg-[#1877F2] text-white border-[#1877F2]/40 hover:border-[#1877F2]"
                        }`}
                      >
                        {report.reportedPlayer.isVerified ? "✓ Verified Pro" : "Grant Blue Tick"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(report.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 md:flex-initial bg-gaming-gray hover:bg-gray-800 text-gray-200 border border-gaming-gray hover:border-gray-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer disabled:opacity-50"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(report.id, report.reportedPlayer.id, report.reportedPlayer.ign)}
                      disabled={actionLoading !== null}
                      className="flex-1 md:flex-initial bg-airdrop-red/15 hover:bg-airdrop-red text-white border border-airdrop-red/30 hover:border-airdrop-red px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer disabled:opacity-50"
                    >
                      Delete Account
                    </button>
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
