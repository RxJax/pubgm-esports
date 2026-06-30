import { prisma } from "@/lib/db";
import DiscoveryClient from "./components/DiscoveryClient";

// Opt out of caching so database updates/seeds are reflected immediately
export const revalidate = 0;

export default async function Home() {
  let players: any[] = [];
  let dbError = false;

  try {
    // Query players sorted by most recently updated
    players = await prisma.player.findMany({
      include: {
        team: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch (error: any) {
    console.warn("⚠️ Database connection failed: The remote Supabase PostgreSQL database is currently unreachable (requires IPv6). Serving offline empty state.");
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <DiscoveryClient initialPlayers={players} initialError={dbError} />
    </main>
  );
}
