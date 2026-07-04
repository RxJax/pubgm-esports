import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RosterSubmitSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { orgId?: string; role?: string };
    if (!decoded.orgId || decoded.role !== "organization") {
      return NextResponse.json({ error: "Access denied. Organization account required." }, { status: 403 });
    }

    const body = await request.json();
    const result = RosterSubmitSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid roster data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { teamName, tag, logoUrl, playerIds } = result.data;

    // Check if players exist in the database
    const dbPlayers = await prisma.player.findMany({
      where: {
        id: { in: playerIds },
      },
    });

    if (dbPlayers.length !== playerIds.length) {
      return NextResponse.json({ error: "One or more selected players could not be found." }, { status: 400 });
    }

    // Create a new TeamRoster in PENDING status
    const roster = await prisma.teamRoster.create({
      data: {
        teamName,
        tag: tag || null,
        logoUrl: logoUrl || null,
        status: "PENDING",
        organizationId: decoded.orgId,
        players: {
          connect: playerIds.map((id: string) => ({ id })),
        },
      },
      include: {
        players: true,
      },
    });

    return NextResponse.json({ success: true, roster });
  } catch (error: any) {
    console.error("Roster submission failed:", error);
    return NextResponse.json({ error: "Failed to submit roster. Internal error." }, { status: 500 });
  }
}
