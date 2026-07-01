import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DiscoveryClient from "./components/DiscoveryClient";

// Opt out of caching so database updates are reflected immediately
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
  let featuredPlayers: any[] = [];
  let dbError = false;

  try {
    // 1. General Candidate Pool Feed (excluding the current user, ordered by updatedAt desc)
    players = await prisma.player.findMany({
      where: loggedInPlayerId ? {
        NOT: { id: loggedInPlayerId }
      } : {},
      include: {
        team: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 2. Top Rising Fraggers (excluding the current user, K/D >= 6.0, sorted by K/D desc, limit 4)
    risingPlayers = await prisma.player.findMany({
      where: {
        kdRatio: { gte: 6.0 },
        ...(loggedInPlayerId ? { NOT: { id: loggedInPlayerId } } : {})
      },
      include: {
        team: true,
      },
      orderBy: {
        kdRatio: "desc",
      },
      take: 4,
    });

    // 3. Featured Roster Profiles (excluding the current user, isFeatured = true, limit 3)
    featuredPlayers = await prisma.player.findMany({
      where: {
        isFeatured: true,
        ...(loggedInPlayerId ? { NOT: { id: loggedInPlayerId } } : {})
      },
      include: {
        team: true,
      },
      take: 3,
    });
  } catch (error: any) {
    console.warn("⚠️ Database connection failed: The remote Supabase PostgreSQL database is currently unreachable (requires IPv6). Serving offline empty state.");
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <DiscoveryClient
        initialPlayers={players}
        initialRising={risingPlayers}
        initialFeatured={featuredPlayers}
        initialError={dbError}
        loggedInPlayerId={loggedInPlayerId}
      />
    </main>
  );
}
