import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const revalidate = 0;

// Helper to authenticate admin
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return false;

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    return decoded.email?.toLowerCase() === "rxjax007@gmail.com";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Case 1: Fetch pending registrations
    if (type === "pending") {
      const pendingPlayers = await prisma.player.findMany({
        where: {
          profileType: { not: "Coach" },
          NOT: {
            urRank: { in: ["Legend", "Peerless"] },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(pendingPlayers);
    }

    // Case 2: Standard search
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
        characterId: true,
        avatarUrl: true,
        status: true,
        role: true,
        urRank: true,
        competitiveExperience: true,
        officialTournaments: true,
        kdRatio: true,
        winRate: true,
        headshotPct: true,
        matchesPlayed: true,
        urPoints: true,
        region: true,
        bio: true,
        device: true,
        controlSetup: true,
        underContract: true,
        contractStartDate: true,
        contractEndDate: true,
      },
      take: 20,
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("GET admin players failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      password,
      ign,
      characterId,
      region,
      bio,
      role,
      device,
      controlSetup,
      kdRatio,
      headshotPct,
      winRate,
      matchesPlayed,
      urRank,
      urPoints,
      competitiveExperience,
      officialTournaments,
    } = body;

    if (!email || !password || !ign || !characterId) {
      return NextResponse.json({ error: "Missing required onboarding fields." }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.player.findFirst({
      where: {
        OR: [{ email }, { characterId }],
      },
    });
    if (existing) {
      return NextResponse.json({ error: "A player with this Email or Character ID already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPlayer = await prisma.player.create({
      data: {
        email,
        password: hashedPassword,
        ign,
        characterId,
        region: region || "Southeast Asia",
        bio: bio || "Professional esports competitor.",
        status: "Looking For Team",
        role: role || "Fragger",
        device: device || "iPhone 15 Pro Max",
        controlSetup: controlSetup || "4-Finger Claw",
        kdRatio: parseFloat(kdRatio) || 0,
        headshotPct: parseFloat(headshotPct) || 0,
        winRate: parseFloat(winRate) || 0,
        matchesPlayed: parseInt(matchesPlayed) || 0,
        urRank: urRank || "Vanguard",
        urPoints: parseInt(urPoints) || 0,
        competitiveExperience: parseInt(competitiveExperience) || 1,
        officialTournaments: parseInt(officialTournaments) || 0,
      },
    });

    return NextResponse.json({ success: true, player: newPlayer });
  } catch (error: any) {
    console.error("POST admin players failed:", error);
    return NextResponse.json({ error: error.message || "Failed to onboard player" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing Player ID for update" }, { status: 400 });
    }

    // Format numbers and dates
    if (updateData.kdRatio !== undefined) updateData.kdRatio = parseFloat(updateData.kdRatio) || 0;
    if (updateData.headshotPct !== undefined) updateData.headshotPct = parseFloat(updateData.headshotPct) || 0;
    if (updateData.winRate !== undefined) updateData.winRate = parseFloat(updateData.winRate) || 0;
    if (updateData.matchesPlayed !== undefined) updateData.matchesPlayed = parseInt(updateData.matchesPlayed) || 0;
    if (updateData.urPoints !== undefined) updateData.urPoints = parseInt(updateData.urPoints) || 0;
    if (updateData.competitiveExperience !== undefined) updateData.competitiveExperience = parseInt(updateData.competitiveExperience) || 1;
    if (updateData.officialTournaments !== undefined) updateData.officialTournaments = parseInt(updateData.officialTournaments) || 0;

    // Handle password change if provided
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password; // Do not overwrite if empty
    }

    // Handle contract dates parsing
    if (updateData.underContract !== undefined) {
      if (updateData.underContract) {
        updateData.contractStartDate = updateData.contractStartDate ? new Date(updateData.contractStartDate) : null;
        updateData.contractEndDate = updateData.contractEndDate ? new Date(updateData.contractEndDate) : null;
      } else {
        updateData.contractStartDate = null;
        updateData.contractEndDate = null;
      }
    } else {
      delete updateData.contractStartDate;
      delete updateData.contractEndDate;
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error: any) {
    console.error("PUT admin players failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update player stats" }, { status: 500 });
  }
}
