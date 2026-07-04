import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AdminPlayerOnboardSchema, AdminPlayerEditSchema } from "@/lib/validation";

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
    
    // Strict schema validation using Zod
    const result = AdminPlayerOnboardSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid player onboarding data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

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
    } = result.data;

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
        kdRatio,
        headshotPct,
        winRate,
        matchesPlayed,
        urRank: urRank || "Vanguard",
        urPoints,
        competitiveExperience,
        officialTournaments,
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
    
    // Strict schema validation using Zod
    const result = AdminPlayerEditSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid player edit data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { id, ...updateData } = result.data;
    const prismaUpdateData: any = { ...updateData };

    // Handle password change if provided
    if (updateData.password && updateData.password.trim() !== "") {
      prismaUpdateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete prismaUpdateData.password; // Do not overwrite if empty
    }

    // Handle contract dates parsing
    if (updateData.underContract !== undefined) {
      if (updateData.underContract) {
        prismaUpdateData.contractStartDate = updateData.contractStartDate ? new Date(updateData.contractStartDate) : null;
        prismaUpdateData.contractEndDate = updateData.contractEndDate ? new Date(updateData.contractEndDate) : null;
      } else {
        prismaUpdateData.contractStartDate = null;
        prismaUpdateData.contractEndDate = null;
      }
    } else {
      delete prismaUpdateData.contractStartDate;
      delete prismaUpdateData.contractEndDate;
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: prismaUpdateData,
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error: any) {
    console.error("PUT admin players failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update player stats" }, { status: 500 });
  }
}
