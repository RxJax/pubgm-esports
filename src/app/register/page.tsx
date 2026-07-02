"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

const REGIONS = ["Southeast Asia", "South Asia", "Europe", "North America", "Middle East"];
const ROLES = ["IGL", "Entry Fragger", "Fragger", "Assaulter", "Support", "Sniper", "Scout"];
const UR_RANKS = ["Vanguard", "Exceed", "Supreme", "Peerless", "Legend"];
const SPECIALTIES = ["Analysis", "Tactics", "Strategy", "Training", "VOD Review", "In-Game Leading", "Macro Setup", "Scouting"];

export default function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [ign, setIgn] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [region, setRegion] = useState("Southeast Asia");
  const [role, setRole] = useState("Entry Fragger");
  const [device, setDevice] = useState("iPhone 15 Pro Max");
  const [controlSetup, setControlSetup] = useState("4-finger claw, gyro always-on");
  const [bio, setBio] = useState("");

  const [kdRatio, setKdRatio] = useState("4.50");
  const [headshotPct, setHeadshotPct] = useState("25.0");
  const [winRate, setWinRate] = useState("20.0");
  const [matchesPlayed, setMatchesPlayed] = useState("100");
  const [urRank, setUrRank] = useState("Vanguard");
  const [urPoints, setUrPoints] = useState("0");
  const [teamHistory, setTeamHistory] = useState("");
  const [achievements, setAchievements] = useState("");

  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [discord, setDiscord] = useState("");

  const [profileType, setProfileType] = useState("Player");
  const [coachingYears, setCoachingYears] = useState("0");
  const [coachingHistory, setCoachingHistory] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  const [trophyName, setTrophyName] = useState("");
  const [trophyPlacement, setTrophyPlacement] = useState("1");
  const [trophyTeam, setTrophyTeam] = useState("");
  const [trophyDate, setTrophyDate] = useState("");

  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightUrl, setHighlightUrl] = useState("");

  // Google onboarding states
  const [onboardingData, setOnboardingData] = useState<{ email: string; name: string } | null>(null);
  const [tempCredential, setTempCredential] = useState("");
  const [onboardIgn, setOnboardIgn] = useState("");
  const [onboardUid, setOnboardUid] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Initialize and render the actual Google Sign-In button for Step 1
  useEffect(() => {
    if (step !== 1) return;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "586689563121-tsvddfckhhdre6j743aplleogs91v76t.apps.googleusercontent.com";
    if (!googleClientId) return;

    const initializeGoogleBtn = () => {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              setError("");
              setLoading(true);

              try {
                const res = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ credential: response.credential }),
                });

                const data = await res.json();
                if (res.ok) {
                  if (data.onboardingRequired) {
                    setOnboardingData({ email: data.email, name: data.name });
                    setTempCredential(response.credential);
                    // Prepopulate name
                    setOnboardIgn(data.name ? data.name.replace(/\s+/g, "_") : "");
                  } else {
                    router.push("/dashboard");
                    router.refresh();
                  }
                } else {
                  setError(data.error || "Google Sign-In failed validation.");
                }
              } catch (err) {
                console.error(err);
                setError("A connection error occurred during Google Auth verification.");
              } finally {
                setLoading(false);
              }
            },
          });

          const btnContainer = document.getElementById("google-signup-btn");
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "filled_black",
              size: "large",
              text: "signup_with",
              shape: "rectangular",
              width: btnContainer.clientWidth || 382,
            });
          }
        }
      } catch (err) {
        console.error("Failed to initialize Google GSI:", err);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleBtn();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGoogleBtn();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [step, router, onboardingData]);

  // Move to next step with basic validation
  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        setError("Please fill out all credentials.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    } else if (step === 2) {
      if (profileType === "Coach") {
        if (!ign || !characterId || !coachingHistory) {
          setError("Please fill out IGN, UID, and Teams Coached.");
          return;
        }
      } else {
        if (!ign || !characterId || !device || !controlSetup) {
          setError("Please fill out IGN, UID, Device, and Control Setup.");
          return;
        }
      }
      if (!/^\d{5,12}$/.test(characterId)) {
        setError("UID must be a valid numeric ID (5 to 12 digits).");
        return;
      }
    } else if (step === 3) {
      if (profileType !== "Coach") {
        if (!kdRatio || !headshotPct || !winRate || !matchesPlayed || !urRank || !urPoints) {
          setError("Please fill out all competitive statistics.");
          return;
        }
        const kd = parseFloat(kdRatio);
        const hs = parseFloat(headshotPct);
        const wr = parseFloat(winRate);
        const matches = parseInt(matchesPlayed);
        const points = parseInt(urPoints);
        
        if (isNaN(kd) || kd < 0 || kd > 15) {
          setError("UR K/D Ratio must be a positive number up to 15.0.");
          return;
        }
        if (isNaN(hs) || hs < 0 || hs > 100 || isNaN(wr) || wr < 0 || wr > 100) {
          setError("Percentages must be numbers between 0 and 100.");
          return;
        }
        if (isNaN(matches) || matches < 0) {
          setError("Matches played must be a positive integer.");
          return;
        }
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // Submit onboarding payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      email,
      password,
      ign,
      characterId,
      region,
      role,
      device,
      controlSetup,
      bio,
      kdRatio: parseFloat(kdRatio) || 0,
      headshotPct: parseFloat(headshotPct) || 0,
      winRate: parseFloat(winRate) || 0,
      matchesPlayed: parseInt(matchesPlayed) || 0,
      urRank,
      urPoints: parseInt(urPoints) || 0,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: null,
      discord: discord || null,
      teamHistory: teamHistory || null,
      achievements: achievements || null,
      trophyName,
      trophyPlacement: parseInt(trophyPlacement) || 1,
      trophyTeam: trophyTeam || "Free Agent",
      trophyDate,
      highlightTitle,
      highlightUrl,
      profileType,
      coachingYears: parseInt(coachingYears) || 0,
      coachingHistory: coachingHistory || null,
      specialties: specialties.join(",") || null,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const errData = await res.json();
        setError(errData.error || "Onboarding failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("A connection error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOnboardLoading(true);

    try {
      const res = await fetch("/api/auth/google/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: tempCredential,
          ign: onboardIgn,
          characterId: onboardUid,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection error occurred. Please try again.");
    } finally {
      setOnboardLoading(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "586689563121-tsvddfckhhdre6j743aplleogs91v76t.apps.googleusercontent.com";

  if (onboardingData) {
    return (
      <div className="flex-1 bg-gaming-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full bg-gaming-black border-2 border-gaming-gray rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="text-[9px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2.5 py-0.5 rounded-full tracking-widest">
              Google Onboarding
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-3">
              Set Your Identity
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select your IGN and UID for <span className="text-digital-yellow">{onboardingData.email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-airdrop-red/10 border border-airdrop-red/30 text-airdrop-red text-xs font-black p-3 rounded-xl mb-4 text-center animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">In-Game Name (IGN)</label>
              <input
                type="text"
                placeholder="e.g. RX_JAX"
                value={onboardIgn}
                onChange={(e) => setOnboardIgn(e.target.value)}
                className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UID (In-Game ID)</label>
              <input
                type="text"
                placeholder="e.g. 586856329"
                value={onboardUid}
                onChange={(e) => setOnboardUid(e.target.value)}
                className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={onboardLoading}
              className="w-full mt-2 bg-[#FFBD03] hover:bg-amber-500 text-gaming-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition shadow-md shadow-amber-950/20 cursor-pointer"
            >
              {onboardLoading ? "Creating Profile..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setOnboardingData(null)}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-300 uppercase tracking-wider mt-1"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gaming-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div className="max-w-md w-full bg-gaming-black border-2 border-gaming-gray rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Visual Header */}
        <div className="text-center mb-6">
          <span className="text-[9px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2.5 py-0.5 rounded-full tracking-widest">
            Step {step} of 4
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-3">
            Build Roster Profile
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Create your digital portfolio and get discovered by top team scouts.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex justify-between items-center gap-1.5 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                step >= i ? "bg-digital-yellow shadow-[0_0_5px_rgba(255,189,3,0.3)]" : "bg-gaming-gray"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-airdrop-red/10 border border-airdrop-red/30 text-airdrop-red text-xs font-black p-3 rounded-xl mb-4 text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* STEP 1: Credentials */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password (Min 6 chars)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                  required
                />
              </div>

              {/* Google signup button */}
              <div className="flex flex-col gap-2 border-t border-gaming-gray/40 pt-4 mt-1">
                {googleClientId ? (
                  <div className="flex flex-col gap-2">
                    <div id="google-signup-btn" className="w-full flex justify-center" />
                    <p className="text-[9px] text-gray-500 text-center">
                      Onboard securely using your Google credentials.
                    </p>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 text-center border border-dashed border-gaming-gray p-3.5 rounded-xl">
                    ⚠️ Google Onboarding is pending config. Set <code className="text-digital-yellow">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in environment variables to activate.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Profile specifics */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Profile Type</label>
                <select
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition w-full"
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
                    placeholder="e.g. APX.Slayer"
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
                    placeholder="e.g. 5123984712"
                    value={characterId}
                    onChange={(e) => setCharacterId(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {profileType === "Coach" ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Years of Coaching Experience</label>
                    <select
                      value={coachingYears}
                      onChange={(e) => setCoachingYears(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition w-full"
                    >
                      <option value="0">0 years</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3 years</option>
                      <option value="4">4 years</option>
                      <option value="5">5+ years</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Playstyle Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none transition"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {profileType === "Coach" ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teams Coached (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Nova Esports, Alpha Team, Apex Esports"
                      value={coachingHistory}
                      onChange={(e) => setCoachingHistory(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Core Specialties</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {SPECIALTIES.map((tag) => {
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
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition text-center cursor-pointer ${
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gaming Device</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro Max"
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Control Setup</label>
                    <input
                      type="text"
                      placeholder="e.g. 4-finger claw, gyro always-on"
                      value={controlSetup}
                      onChange={(e) => setControlSetup(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bio description</label>
                <textarea
                  placeholder="Write a brief intro..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Competitive Experience & Achievements */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
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
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tournament Achievements & Highlights</label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="e.g. 1st Place PMCO 2025, MVP PMSL Season 2"
                  rows={2}
                  className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition resize-none"
                />
              </div>


            </div>
          )}

          {/* STEP 4: Trophy, Highlights & Contacts */}
          {step === 4 && (
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gaming-gray">
              {/* Optional Contacts */}
              <div className="border border-gaming-gray rounded-2xl p-4 bg-gaming-gray/10 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  📱 Social Handles & Contacts (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Discord username</label>
                    <input
                      type="text"
                      placeholder="e.g. name#0000 or username"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-digital-yellow"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Instagram link</label>
                    <input
                      type="text"
                      placeholder="e.g. instagram.com/name"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-digital-yellow"
                    />
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Facebook link</label>
                    <input
                      type="text"
                      placeholder="e.g. facebook.com/name"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-digital-yellow"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Placement */}
              <div className="border border-gaming-gray rounded-2xl p-4 bg-gaming-gray/10 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  🏆 Log First Placement (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tournament Name</label>
                    <input
                      type="text"
                      placeholder="e.g. PMPL Spring"
                      value={trophyName}
                      onChange={(e) => setTrophyName(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
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
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Team Represented</label>
                    <input
                      type="text"
                      placeholder="e.g. Underdogs"
                      value={trophyTeam}
                      onChange={(e) => setTrophyTeam(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tournament Date (YYYY-MM)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-05"
                      value={trophyDate}
                      onChange={(e) => setTrophyDate(e.target.value)}
                      className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Highlight */}
              <div className="border border-gaming-gray rounded-2xl p-4 bg-gaming-gray/10 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  🎥 Add Video Highlight Link (Optional)
                </h4>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Showcase Clip Title</label>
                  <input
                    type="text"
                    placeholder="e.g. PMGC MVP Highlights"
                    value={highlightTitle}
                    onChange={(e) => setHighlightTitle(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Video URL (YouTube/TikTok link)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    value={highlightUrl}
                    onChange={(e) => setHighlightUrl(e.target.value)}
                    className="bg-[#0b0f19] border border-gaming-gray rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center gap-3 mt-6 border-t border-gaming-gray pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gaming-gray hover:bg-gray-800 text-gray-300 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Back
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs font-black text-gray-500 hover:text-gray-300 uppercase tracking-wider"
              >
                Already have a profile?
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-digital-yellow hover:bg-amber-500 text-gaming-black font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest transition shadow-md shadow-amber-950/20 cursor-pointer"
              >
                {loading ? "Creating Profile..." : "Submit Portfolio"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

