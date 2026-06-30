import { prisma } from "@/lib/db";
import DiscoveryClient from "./components/DiscoveryClient";

// Opt out of caching so database updates/seeds are reflected immediately
export const revalidate = 0;

export default async function Home() {
  // Query players sorted by most recently updated
  const players = await prisma.player.findMany({
    include: {
      team: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <DiscoveryClient initialPlayers={players} />
    </main>
  );
}
