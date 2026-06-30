import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import DashboardClient from "@/app/components/DashboardClient";

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
  try {
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
    console.warn("⚠️ Database connection failed: The remote Supabase PostgreSQL database is currently unreachable (requires IPv6).");
  }

  if (!player) {
    redirect("/login");
  }

  return <DashboardClient player={player} />;
}
