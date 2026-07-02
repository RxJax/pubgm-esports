"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google onboarding states
  const [onboardingData, setOnboardingData] = useState<{ email: string; name: string } | null>(null);
  const [tempCredential, setTempCredential] = useState("");
  const [onboardIgn, setOnboardIgn] = useState("");
  const [onboardUid, setOnboardUid] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Initialize and render the actual Google Sign-In button
  useEffect(() => {
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

          const btnContainer = document.getElementById("google-signin-btn");
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "filled_black",
              size: "large",
              text: "signin_with",
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
  }, [router, onboardingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed. Check your credentials.");
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
        <div className="text-center mb-6">
          <span className="text-[9px] font-black uppercase bg-digital-yellow/10 text-digital-yellow border border-digital-yellow/20 px-2.5 py-0.5 rounded-full tracking-widest">
            Welcome Back
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-3">
            Player Sign In
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Access your secure dashboard to manage your esports portfolio.
          </p>
        </div>

        {error && (
          <div className="bg-airdrop-red/10 border border-airdrop-red/30 text-airdrop-red text-xs font-black p-3 rounded-xl mb-4 text-center animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0b0f19] border border-gaming-gray focus:border-digital-yellow rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#FFBD03] hover:bg-amber-500 text-gaming-black font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition shadow-md shadow-amber-950/20 cursor-pointer"
          >
            {loading ? "Signing In..." : "Authenticate"}
          </button>

          {/* Google Login official container */}
          <div className="flex flex-col gap-3.5 mt-2.5 border-t border-gaming-gray/50 pt-4">
            {googleClientId ? (
              <div className="flex flex-col gap-2">
                <div id="google-signin-btn" className="w-full flex justify-center" />
                <p className="text-[9px] text-gray-500 text-center">
                  Secure single sign-on powered by Google Identity.
                </p>
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 text-center border border-dashed border-gaming-gray p-3.5 rounded-xl">
                ⚠️ Google Sign-In is pending config. Set <code className="text-digital-yellow">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in environment variables to activate.
              </div>
            )}
          </div>

          <div className="text-center mt-2">
            <Link
              href="/register"
              className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider"
            >
              Don't have a profile yet? <span className="text-digital-yellow underline">Register</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

