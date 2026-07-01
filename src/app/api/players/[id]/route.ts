import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
    console.error("API GET player detail error:", error);
    return NextResponse.json({ error: "Failed to fetch player details" }, { status: 500 });
  }
}

// Update player details (Owner-Only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Strict Owner Authorization Check (Row-Level Security)
    const session = getSession(request);
    if (!session || session.playerId !== id) {
      return NextResponse.json({ error: "Unauthorized. You are not the owner of this profile." }, { status: 401 });
    }

    const body = await request.json();
    const {
      ign,
      status,
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
    } = body;

    // Safety validation bounds on statistics
    const validatedKd = Math.max(0, Math.min(15, parseFloat(kdRatio) || 0));
    const validatedHs = Math.max(0, Math.min(100, parseFloat(headshotPct) || 0));
    const validatedWr = Math.max(0, Math.min(100, parseFloat(winRate) || 0));
    const validatedMatches = Math.max(0, parseInt(matchesPlayed) || 0);
    const validatedPoints = Math.max(0, parseInt(urPoints) || 0);

    // Update the player record in database
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        ign: ign || undefined,
        status,
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
      },
    });

    // Handle adding a new tournament placement (trophy)
    if (newTrophy && newTrophy.tournamentName && newTrophy.placement) {
      await prisma.tournamentPlacement.create({
        data: {
          date: newTrophy.date || new Date().toISOString().substring(0, 7), // YYYY-MM
          tournamentName: newTrophy.tournamentName,
          teamRepresented: newTrophy.teamRepresented || "Free Agent",
          placement: parseInt(newTrophy.placement) || 1,
          playerId: id,
        },
      });
    }

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error: any) {
    console.error("API PUT player error:", error);
    return NextResponse.json({ error: "Failed to update player details" }, { status: 500 });
  }
}
