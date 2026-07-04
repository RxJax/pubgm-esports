import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Strict schema validation using Zod
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      email,
      password,
      ign,
      characterId,
      region,
      role,
      device,
      controlSetup,
      bio,
      kdRatio,
      headshotPct,
      winRate,
      matchesPlayed,
      urRank,
      urPoints,
      facebook,
      instagram,
      twitter,
      discord,
      teamHistory,
      achievements,
      trophyName,
      trophyPlacement,
      trophyTeam,
      trophyDate,
      highlightTitle,
      highlightUrl,
      profileType,
      coachingYears,
      coachingHistory,
      specialties,
    } = result.data;

    // Check duplicate email or characterId
    const existingPlayer = await prisma.player.findFirst({
      where: {
        OR: [
          { email },
          { characterId },
        ],
      },
    });

    if (existingPlayer) {
      return NextResponse.json({ error: "A player with this Email or Character ID already exists" }, { status: 400 });
    }

    // Hash password credentials
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate numbers (bounds checks)
    const parsedKd = Math.max(0, Math.min(15, kdRatio));
    const parsedHs = Math.max(0, Math.min(100, headshotPct));
    const parsedWr = Math.max(0, Math.min(100, winRate));
    const parsedMatches = Math.max(0, matchesPlayed);
    const parsedPoints = Math.max(0, urPoints);

    // Create player profile with optional contacts
    const newPlayer = await prisma.player.create({
      data: {
        email,
        password: hashedPassword,
        ign,
        characterId,
        region,
        bio: bio || `Professional esports profile representing ${region}.`,
        status: "Looking For Team", // Defaults to Free Agent LFT
        role,
        device,
        controlSetup,
        kdRatio: parsedKd,
        headshotPct: parsedHs,
        winRate: parsedWr,
        matchesPlayed: parsedMatches,
        urRank: urRank || "Vanguard",
        urPoints: parsedPoints,
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        discord: discord || null,
        teamHistory: teamHistory || null,
        achievements: achievements || null,
        profileType: profileType || "Player",
        coachingYears: coachingYears ?? 0,
        coachingHistory: coachingHistory || null,
        specialties: specialties || null,
      },
    });

    // Create initial placements (trophies) if populated in step 4
    if (trophyName) {
      await prisma.tournamentPlacement.create({
        data: {
          date: trophyDate || new Date().toISOString().substring(0, 7),
          tournamentName: trophyName,
          teamRepresented: trophyTeam || "Free Agent",
          placement: trophyPlacement ?? 1,
          playerId: newPlayer.id,
        },
      });
    }

    // Create initial video showcase highlight if populated in step 4
    if (highlightUrl) {
      let embedUrl = highlightUrl;
      // Convert standard YouTube watch links to embed links if necessary
      if (highlightUrl.includes("watch?v=")) {
        embedUrl = highlightUrl.replace("watch?v=", "embed/");
      }
      await prisma.highlight.create({
        data: {
          title: highlightTitle || "Player Highlights",
          url: embedUrl,
          playerId: newPlayer.id,
        },
      });
    }

    // Log the user in directly via session cookie
    const response = NextResponse.json({ success: true, player: { id: newPlayer.id, ign: newPlayer.ign } });
    return setAuthCookie(response, {
      playerId: newPlayer.id,
      email: newPlayer.email,
      ign: newPlayer.ign,
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Registration failed. Internal database error." }, { status: 500 });
  }
}
