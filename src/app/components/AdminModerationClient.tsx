"use client";

import React, { useState, memo } from "react";
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

interface SearchResultPlayer {
  id: string;
  ign: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  isVerified: boolean;
}

const AdminSearchResultRow = memo(({
  player,
  actionLoading,
  handleToggleVerification,
}: {
  player: SearchResultPlayer;
  actionLoading: string | null;
  handleToggleVerification: (id: string, isVerified: boolean) => void;
}) => {
  return (
    <div className="bg-gaming-black/80 border border-gaming-gray/60 rounded-2xl p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
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
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wide truncate">
              {player.ign}
            </h4>
            {player.isVerified && (
              <span className="relative group/tooltip inline-flex items-center shrink-0 align-middle cursor-pointer" tabIndex={0}>
                <span className="inline-flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#1877F2] text-white select-none pointer-events-auto shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 112, 243, 0.7))' }}>
                  <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white bg-black border border-gaming-gray rounded-lg opacity-0 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 shadow-xl font-sans normal-case">
                  Verified Pro
                </span>
              </span>
            )}
          </div>
          <p className="text-[9px] text-gray-500 font-mono truncate">{player.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleToggleVerification(player.id, player.isVerified)}
        disabled={actionLoading === `verify-${player.id}`}
        className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-2 rounded-lg border transition cursor-pointer shrink-0 ${
          player.isVerified
            ? "bg-airdrop-red/10 border-airdrop-red/30 hover:border-airdrop-red text-airdrop-red hover:bg-airdrop-red/20"
            : "bg-[#1877F2]/10 border-[#1877F2]/30 hover:border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/20"
        }`}
      >
        {player.isVerified ? "Revoke Blue Tick" : "Grant Blue Tick"}
      </button>
    </div>
  );
});
AdminSearchResultRow.displayName = "AdminSearchResultRow";

export default function AdminModerationClient({ initialReports, adminId, adminIgn, adminEmail }: AdminModerationClientProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Direct Player Verification Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; ign: string; email: string; avatarUrl: string | null; status: string; isVerified: boolean }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Maintenance Mode States
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Registration Queue States
  const [activeTab, setActiveTab] = useState<"reports" | "registrations">("reports");
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  React.useEffect(() => {
    if (activeTab === "registrations") {
      const fetchRegistrations = async () => {
        setRegistrationsLoading(true);
        try {
          const res = await fetch("/api/admin/players?type=pending");
          if (res.ok) {
            const data = await res.json();
            setPendingRegistrations(data);
          }
        } catch (e) {
          console.error("Failed to fetch pending registrations:", e);
        } finally {
          setRegistrationsLoading(false);
        }
      };
      fetchRegistrations();
    }
  }, [activeTab]);

  const handleAssignTier = async (playerId: string, tier: "Legend" | "Peerless", ign: string) => {
    setActionLoading(`tier-${playerId}`);
    try {
      const res = await fetch("/api/admin/players", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, urRank: tier }),
      });

      if (res.ok) {
        setPendingRegistrations((prev) => prev.filter((p) => p.id !== playerId));
        alert(`Success: Assigned "${ign}" to ${tier === "Legend" ? "Tier-1 Pro" : "Tier-2 Pro"} status!`);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to assign tier"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to assign tier.");
    } finally {
      setActionLoading(null);
    }
  };

  React.useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const res = await fetch("/api/maintenance");
        if (res.ok) {
          const data = await res.json();
          setMaintenanceActive(data.maintenanceActive);
        }
      } catch (e) {
        console.error("Failed to fetch maintenance status:", e);
      }
    };
    fetchMaintenanceStatus();
  }, []);

  const handleToggleMaintenance = async () => {
    const confirmed = confirm(
      maintenanceActive
        ? "Are you sure you want to deactivate Maintenance Mode? Public access to the scouting portal will be immediately restored."
        : "⚠️ WARNING: Are you sure you want to activate Maintenance Mode? This will immediately redirect all public visitors to the offline maintenance screen."
    );
    if (!confirmed) return;

    setMaintenanceLoading(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceActive: !maintenanceActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setMaintenanceActive(data.maintenanceActive);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to update maintenance configuration"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to toggle maintenance configuration.");
    } finally {
      setMaintenanceLoading(false);
    }
  };

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

        {/* Sub-navigation Header */}
        <div className="flex gap-4 border-b border-gaming-gray pb-4 mb-8">
          <Link
            href="/admin/moderation"
            className="text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-airdrop-red/10 border border-airdrop-red text-airdrop-red rounded-lg transition"
          >
            🛡️ Moderation Center
          </Link>
          <Link
            href="/admin/players"
            className="text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-gaming-gray/20 border border-gaming-gray/30 text-gray-400 hover:text-white rounded-lg transition"
          >
            👥 Manage Players
          </Link>
        </div>

        {/* Global Server Maintenance Mode Config Card */}
        {adminEmail?.toLowerCase() === "rxjax007@gmail.com" && (
          <div className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-6 mb-8 relative overflow-hidden shadow-lg shadow-black/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-airdrop-red/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xs font-black text-airdrop-red uppercase tracking-widest flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-3 bg-airdrop-red" /> Global Server Maintenance
                </h2>
                <p className="text-gray-400 text-xs max-w-xl">
                  Activating Maintenance Mode immediately redirects all public visitors to the offline card, while authenticated developers maintain live access to perform validation and updates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleMaintenance}
                disabled={maintenanceLoading}
                className={`min-h-[44px] px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer shrink-0 ${
                  maintenanceActive
                    ? "bg-airdrop-red/10 border-airdrop-red text-airdrop-red hover:bg-airdrop-red/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-gaming-gray border-gaming-gray text-gray-400 hover:border-gray-500 hover:text-white"
                }`}
              >
                {maintenanceLoading ? "Processing..." : maintenanceActive ? "🔴 MAINTENANCE ACTIVE" : "⚪ ACTIVATE MAINTENANCE"}
              </button>
            </div>
          </div>
        )}

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
                    <AdminSearchResultRow
                      key={p.id}
                      player={p}
                      actionLoading={actionLoading}
                      handleToggleVerification={handleToggleVerification}
                    />
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
           {/* Reports / Registrations Tab Control */}
        <div className="flex gap-4 border-b border-gaming-gray/40 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition cursor-pointer ${
              activeTab === "reports"
                ? "border-digital-yellow text-digital-yellow"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Active Pending Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("registrations")}
            className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition cursor-pointer ${
              activeTab === "registrations"
                ? "border-digital-yellow text-digital-yellow"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Review Registrations ({pendingRegistrations.length})
          </button>
        </div>

        {/* Reports Section */}
        {activeTab === "reports" && (
          <div className="flex flex-col gap-6">
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
                      <div className="w-12 h-12 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
                        {report.reportedPlayer.avatarUrl ? (
                          <img src={report.reportedPlayer.avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                            <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                            <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1 justify-start">
                          <h3 className="font-extrabold text-white text-sm uppercase tracking-wide truncate">
                            {report.reportedPlayer.ign}
                          </h3>
                          <span className="text-[9px] font-black uppercase bg-gaming-gray border border-gaming-gray/80 px-2 py-0.5 rounded text-gray-400">
                            {report.reportedPlayer.role}
                          </span>
                          {report.reportedPlayer.isVerified && (
                            <span className="relative group/tooltip inline-flex items-center shrink-0 align-middle cursor-pointer" tabIndex={0}>
                              <span className="inline-flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#1877F2] text-white select-none pointer-events-auto shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 112, 243, 0.7))' }}>
                                <svg className="w-[8px] h-[8px] text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white bg-black border border-gaming-gray rounded-lg opacity-0 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 shadow-xl font-sans normal-case">
                                Verified Pro
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2.5 text-[9px] font-mono text-gray-500 mb-3 uppercase">
                          <span>🆔 ID: {report.reportedPlayer.characterId}</span>
                          <span>•</span>
                          <span>🌍 {report.reportedPlayer.region}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-airdrop-red/10 border border-airdrop-red/20 px-2 py-0.5 rounded text-airdrop-red">
                            ⚠️ {report.reasonCategory}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 font-mono">
                            {new Date(report.createdAt).toLocaleString()}
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
        )}

        {/* Registrations Section */}
        {activeTab === "registrations" && (
          <div className="flex flex-col gap-6">
            {registrationsLoading ? (
              <div className="text-center py-10 text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                Loading registrations...
              </div>
            ) : pendingRegistrations.length === 0 ? (
              <div className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-3xl">🎉</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Pending Registrations</h3>
                <p className="text-gray-500 text-xs max-w-xs">
                  All registered players have already been successfully assigned to Tier-1 or Tier-2 tiers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRegistrations.map((player) => (
                  <div
                    key={player.id}
                    className="bg-[#0d0e12] border border-gaming-gray rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gaming-black border border-gaming-gray overflow-hidden flex items-center justify-center shrink-0">
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600 bg-[#1c1f26]">
                            <circle cx="50" cy="35" r="20" fill="currentColor" opacity="0.4" />
                            <path d="M15,85 C15,60 30,55 50,55 C70,55 85,60 85,85 Z" fill="currentColor" opacity="0.6" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm uppercase tracking-wide truncate">
                            {player.ign}
                          </h4>
                          <span className="text-[9px] font-black uppercase bg-gaming-gray border border-gaming-gray px-1.5 py-0.5 rounded text-gray-400">
                            {player.urRank}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono truncate">{player.email}</p>
                        <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">{player.bio || "No biography provided."}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-mono text-gray-500">
                          <span>🎮 Role: <strong className="text-gray-300 uppercase">{player.role}</strong></span>
                          <span>•</span>
                          <span>📱 Device: <strong className="text-gray-300">{player.device}</strong></span>
                          <span>•</span>
                          <span>⚔️ K/D: <strong className="text-gray-300">{player.kdRatio}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-gaming-gray/30">
                      <button
                        type="button"
                        onClick={() => handleAssignTier(player.id, "Legend", player.ign)}
                        disabled={actionLoading === `tier-${player.id}`}
                        className="flex-1 bg-digital-yellow/10 border border-digital-yellow/30 hover:border-digital-yellow text-digital-yellow hover:bg-digital-yellow/20 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition cursor-pointer text-center"
                      >
                        Assign Tier-1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAssignTier(player.id, "Peerless", player.ign)}
                        disabled={actionLoading === `tier-${player.id}`}
                        className="flex-1 bg-[#bf5af2]/10 border border-[#bf5af2]/30 hover:border-[#bf5af2] text-[#bf5af2] hover:bg-[#bf5af2]/20 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition cursor-pointer text-center"
                      >
                        Assign Tier-2
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
