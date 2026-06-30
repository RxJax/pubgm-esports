import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import PlayerPortfolioClient from "@/app/components/PlayerPortfolioClient";

export const revalidate = 0;

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;

  let player = null;
  try {
    // Query player data with all nested relations directly on the server
    player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            players: {
              select: {
                id: true,
                ign: true,
                role: true,
                status: true,
                kdRatio: true,
                urRank: true,
              },
            },
          },
        },
        placements: {
          orderBy: {
            date: "desc",
          },
        },
        highlights: true,
      },
    });
  } catch (error: any) {
    console.warn("⚠️ Database connection failed: The remote Supabase PostgreSQL database is currently unreachable (requires IPv6).");
  }

  if (!player) {
    notFound();
  }

  // Server-side check for profile ownership
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let isOwner = false;

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
      const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };
      if (decoded.playerId === player.id) {
        isOwner = true;
      }
    } catch (e) {
      // Invalid/expired session token
    }
  }

  // Render the portfolio with ownership context
  return <PlayerPortfolioClient player={player} isOwner={isOwner} />;
}
