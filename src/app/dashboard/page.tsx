import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";

import DatabaseErrorCard from "@/app/components/DatabaseErrorCard";
import OrgDashboardClient from "@/app/components/OrgDashboardClient";

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
  let orgId = "";
  let isOrg = false;
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { playerId?: string; orgId?: string; role?: string };
    
    if (decoded.role === "organization" || decoded.orgId) {
      orgId = decoded.orgId || "";
      isOrg = true;
    } else {
      playerId = decoded.playerId || "";
    }
  } catch (e) {
    redirect("/login");
  }

  // Handle Organization dashboard loading
  if (isOrg) {
    let org = null;
    let dbError = false;
    try {
      org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          rosters: {
            include: {
              players: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    } catch (error) {
      console.error("Database connection failed:", error);
      dbError = true;
    }

    if (dbError) {
      return <DatabaseErrorCard />;
    }

    if (!org) {
      redirect("/login");
    }

    return <OrgDashboardClient organization={org} />;
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
