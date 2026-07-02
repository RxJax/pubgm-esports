import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Navbar from "@/app/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUBGM Portfolio & Player Discovery",
  description: "Showcase your PUBG Mobile stats, tournament achievements, playstyle, and highlight reels. Discover tier-1 esports talent.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check HTTP-only cookie on the server
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let isLoggedIn = false;
  let playerIgn = "";
  let playerId = "";
  let isAdmin = false;

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
      const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string; ign: string; email?: string; role?: string };
      isLoggedIn = true;
      playerIgn = decoded.ign;
      playerId = decoded.playerId;
      isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    } catch (e) {
      // Cookie is invalid or expired
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gaming-black">
        <Navbar isLoggedIn={isLoggedIn} playerIgn={playerIgn} playerId={playerId} isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
