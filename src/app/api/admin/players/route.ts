import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string };
    const isAdmin = decoded.email === "rxjax007@gmail.com";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json([]);
    }

    const players = await prisma.player.findMany({
      where: {
        OR: [
          { ign: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        ign: true,
        email: true,
        avatarUrl: true,
        status: true,
        isVerified: true,
      },
      take: 20,
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Admin player search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
