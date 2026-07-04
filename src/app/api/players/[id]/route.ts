import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PlayerEditSelfSchema } from "@/lib/validation";

// Fetch player details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const player = await prisma.player.findUnique({
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
              },
              orderBy: {
                ign: "asc",
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

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}

// Update player details (Owner-Only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Strict Owner or Admin Authorization Check (Row-Level Security)
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    let isAdmin = false;
    let isOwner = false;

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
        const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string; playerId?: string };
        isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
        isOwner = decoded.playerId === id;
      } catch (e) {
        // invalid token
      }
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized. You do not have permissions to edit this profile." }, { status: 401 });
    }

    const body = await request.json();

    // Strict schema validation using Zod
    const result = PlayerEditSelfSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid edit profile data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      ign,
      status,
      avatarUrl,
      role,
      region,
      kdRatio,
      headshotPct,
      winRate,
      matchesPlayed,
      urRank,
      urPoints,
      device,
      controlSetup,
      bio,
      facebook,
      instagram,
      twitter,
      discord,
      teamHistory,
      achievements,
      newTrophy,
      characterId,
      highestTier,
      newHighlight,
      profileType,
      coachingYears,
      coachingHistory,
      specialties,
      underContract,
      contractStartDate,
      contractEndDate,
      isVerified,
      competitiveExperience,
      officialTournaments,
    } = result.data;

    // Validate characterId (UID) if provided
    let verifiedCharacterId = undefined;
    if (characterId !== undefined && characterId !== null) {
      verifiedCharacterId = characterId.trim();
    }

    // Safety validation bounds on statistics
    const validatedKd = kdRatio !== undefined ? Math.max(0, Math.min(15, kdRatio)) : undefined;
    const validatedHs = headshotPct !== undefined ? Math.max(0, Math.min(100, headshotPct)) : undefined;
    const validatedWr = winRate !== undefined ? Math.max(0, Math.min(100, winRate)) : undefined;
    const validatedMatches = matchesPlayed !== undefined ? Math.max(0, matchesPlayed) : undefined;
    const validatedPoints = urPoints !== undefined ? Math.max(0, urPoints) : undefined;

    // Update the player record in database
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        ign: ign || undefined,
        characterId: verifiedCharacterId,
        status,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        role: role !== undefined ? role : undefined,
        region: region !== undefined ? region : undefined,
        kdRatio: validatedKd,
        headshotPct: validatedHs,
        winRate: validatedWr,
        matchesPlayed: validatedMatches,
        urRank: urRank || "Vanguard",
        urPoints: validatedPoints,
        device,
        controlSetup,
        bio,
        facebook: facebook !== undefined ? facebook : undefined,
        instagram: instagram !== undefined ? instagram : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        discord: discord !== undefined ? discord : undefined,
        teamHistory: teamHistory !== undefined ? teamHistory : undefined,
        achievements: achievements !== undefined ? achievements : undefined,
        highestTier: highestTier !== undefined ? highestTier : undefined,
        profileType: profileType !== undefined ? profileType : undefined,
        coachingYears: coachingYears !== undefined ? coachingYears : undefined,
        coachingHistory: coachingHistory !== undefined ? coachingHistory : undefined,
        specialties: specialties !== undefined ? specialties : undefined,
        underContract: underContract !== undefined ? underContract : undefined,
        contractStartDate: contractStartDate !== undefined ? (contractStartDate ? new Date(contractStartDate) : null) : undefined,
        contractEndDate: contractEndDate !== undefined ? (contractEndDate ? new Date(contractEndDate) : null) : undefined,
        isVerified: isAdmin && isVerified !== undefined ? isVerified : undefined,
        competitiveExperience: competitiveExperience !== undefined ? competitiveExperience : undefined,
        officialTournaments: officialTournaments !== undefined ? officialTournaments : undefined,
      },
    });

    // Handle adding a new tournament placement (trophy)
    if (newTrophy && newTrophy.tournamentName && newTrophy.placement) {
      await prisma.tournamentPlacement.create({
        data: {
          date: newTrophy.date || new Date().toISOString().substring(0, 7), // YYYY-MM
          tournamentName: newTrophy.tournamentName,
          teamRepresented: newTrophy.teamRepresented || "Free Agent",
          placement: newTrophy.placement || 1,
          playerId: id,
        },
      });
    }

    // Handle adding a new highlight clip (video showcase)
    if (newHighlight && newHighlight.videoUrl && newHighlight.title) {
      await prisma.highlight.create({
        data: {
          title: newHighlight.title,
          url: newHighlight.videoUrl,
          thumbnailUrl: newHighlight.thumbnailUrl || null,
          playerId: id,
        },
      });
    }

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      if (target.includes("characterId")) {
        return NextResponse.json({ error: "This UID is already taken by another player." }, { status: 400 });
      }
      if (target.includes("ign")) {
        return NextResponse.json({ error: "This In-Game Name (IGN) is already taken." }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Failed to update player details" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate admin or owner access
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string; playerId: string };
    const isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    
    const isOwner = decoded.playerId === id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access Denied. Platform administrator permissions required." }, { status: 403 });
    }

    // Delete the player from database
    await prisma.player.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Account deleted successfully." });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Failed to delete player account." }, { status: 500 });
  }
}
