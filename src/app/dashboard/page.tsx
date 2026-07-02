import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";

import DatabaseErrorCard from "@/app/components/DatabaseErrorCard";

const DashboardClient = dynamic(() => import("@/app/components/DashboardClient"), {
  loading: () => (
    <div className="min-h-screen bg-gaming-black flex items-center justify-center text-xs font-black text-gray-500 uppercase tracking-widest">
      Loading Control Center...
    </div>
  ),
});

export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let playerId = "";
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };
    playerId = decoded.playerId;
  } catch (e) {
    redirect("/login");
  }

  // Fetch the logged-in player's profile data
  let player = null;
  let dbError = false;
  try {
    // 0. Update activity heartbeat
    try {
      await prisma.player.update({
        where: { id: playerId },
        data: { updatedAt: new Date() },
      });
    } catch (e) {
      // Ignore heartbeat update errors
    }

    player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        placements: {
          orderBy: {
            date: "desc",
          },
        },
        highlights: true,
        team: true,
      },
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    dbError = true;
  }

  if (dbError) {
    return <DatabaseErrorCard />;
  }

  if (!player) {
    redirect("/login");
  }

  return <DashboardClient player={player} />;
}
