import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const DiscoveryClient = dynamic(() => import("./components/DiscoveryClient"), {
  loading: () => (
    <div className="min-h-screen bg-gaming-black flex items-center justify-center text-xs font-black text-gray-500 uppercase tracking-widest">
      Loading Discovery Portal...
    </div>
  ),
});

// Configure dynamic rendering (disabled ISR cache to prevent logged-out navbar state on refresh)
export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let loggedInPlayerId: string | null = null;

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
      const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };
      loggedInPlayerId = decoded.playerId;
    } catch (e) {
      // ignore invalid token
    }
  }

  let players: any[] = [];
  let risingPlayers: any[] = [];
  let tier2Players: any[] = [];
  let risingStars: any[] = [];
  let featuredPlayers: any[] = [];
  let dbError = false;

  try {
    // 0. Update activity heartbeat for logged-in user
    if (loggedInPlayerId) {
      try {
        await prisma.player.update({
          where: { id: loggedInPlayerId },
          data: { updatedAt: new Date() },
        });
      } catch (e) {
        // Ignore DB update errors during heartbeat
      }
    }

    // 1. General Candidate Pool Feed (ordered by updatedAt desc)
    players = await prisma.player.findMany({
      where: {},
      include: {
        team: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 2. Top Rising Prospects (only registered profiles marked with 'Tier-1 Pro' status, sorted by K/D, limit 4)
    risingPlayers = await prisma.player.findMany({
      where: {
        urRank: "Legend",
      },
      include: {
        team: true,
      },
      orderBy: {
        kdRatio: "desc",
      },
      take: 4,
    });

    // 2.5. Tier-2 Prospects (only registered profiles marked with 'Tier-2 Pro' status, sorted by K/D, limit 4)
    tier2Players = await prisma.player.findMany({
      where: {
        urRank: "Peerless",
      },
      include: {
        team: true,
      },
      orderBy: {
        kdRatio: "desc",
      },
      take: 4,
    });

    // 2.75. Rising Stars (only registered profiles marked with Tier-3 Pro, Semi-Pro, or Amateur status, sorted by K/D, limit 4)
    risingStars = await prisma.player.findMany({
      where: {
        urRank: { in: ["Supreme", "Exceed", "Vanguard"] },
      },
      include: {
        team: true,
      },
      orderBy: {
        kdRatio: "desc",
      },
      take: 4,
    });

    // 3. Featured Roster Profiles (isFeatured = true or any active pro, limit 3)
    featuredPlayers = await prisma.player.findMany({
      where: {
        OR: [
          { isFeatured: true },
          { urRank: { in: ["Peerless", "Legend"] } } // Automatically feature any high tier pros
        ]
      },
      include: {
        team: true,
      },
      take: 3,
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <Suspense fallback={<div className="min-h-screen bg-gaming-black flex items-center justify-center text-xs font-black text-gray-500 uppercase tracking-widest">Loading Portal...</div>}>
        <DiscoveryClient
          initialPlayers={players}
          initialRising={risingPlayers}
          initialTier2={tier2Players}
          initialRisingStars={risingStars}
          initialFeatured={featuredPlayers}
          initialError={dbError}
          loggedInPlayerId={loggedInPlayerId}
        />
      </Suspense>
    </main>
  );
}
