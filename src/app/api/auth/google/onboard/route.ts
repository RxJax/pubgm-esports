import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, ign, characterId } = body;

    if (!credential || !ign || !characterId) {
      return NextResponse.json({ error: "Missing required onboarding parameters (credential, IGN, UID)" }, { status: 400 });
    }

    // Validate UID format
    const uidStr = characterId.trim();
    if (!/^\d{5,12}$/.test(uidStr)) {
      return NextResponse.json({ error: "UID must be a valid numeric ID (5 to 12 digits)." }, { status: 400 });
    }

    // 1. Verify the ID token via Google's secure OAuth2 tokeninfo endpoint
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const verifyRes = await fetch(googleVerifyUrl);

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Google OAuth token verification failed. The session has expired." }, { status: 400 });
    }

    const payload = await verifyRes.json();
    const { email, aud } = payload;

    if (!email) {
      return NextResponse.json({ error: "Google account does not contain a verified email address." }, { status: 400 });
    }

    // 2. Validate Google client ID audience matches our environment configuration (if set)
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "586689563121-tsvddfckhhdre6j743aplleogs91v76t.apps.googleusercontent.com";
    if (googleClientId && aud !== googleClientId) {
      console.warn(`Security Warning: Google login audience mismatch. Received: ${aud}, Expected: ${googleClientId}`);
      return NextResponse.json({ error: "Google OAuth security verification failed: Audience client ID mismatch." }, { status: 400 });
    }

    // 3. Check duplicate email, characterId, or ign
    const existingPlayer = await prisma.player.findFirst({
      where: {
        OR: [
          { email },
          { characterId: uidStr },
          { ign: { equals: ign.trim(), mode: "insensitive" } },
        ],
      },
    });

    if (existingPlayer) {
      if (existingPlayer.email === email) {
        return NextResponse.json({ error: "You already have an account registered with this Google email." }, { status: 400 });
      }
      if (existingPlayer.characterId === uidStr) {
        return NextResponse.json({ error: "This UID is already taken by another player." }, { status: 400 });
      }
      return NextResponse.json({ error: "This In-Game Name (IGN) is already taken." }, { status: 400 });
    }

    // 4. Create new player profile card in the database
    const dummyPassword = await bcrypt.hash(`google-oauth-dummy-pw-${Date.now()}`, 10);

    const player = await prisma.player.create({
      data: {
        email,
        password: dummyPassword,
        ign: ign.trim(),
        characterId: uidStr,
        region: "North America",
        bio: "Competitor profile onboarded via Google login.",
        status: "Looking For Team",
        role: "Entry Fragger",
        device: "iPhone 15 Pro",
        controlSetup: "4-finger claw, gyro always-on",
        kdRatio: 2.0,
        headshotPct: 15.0,
        winRate: 10.0,
        matchesPlayed: 10,
        urRank: "Vanguard",
        urPoints: 1000,
      },
    });

    // 5. Generate JWT cookie session and return response
    const response = NextResponse.json({
      success: true,
      player: { id: player.id, ign: player.ign, email: player.email },
    });

    return setAuthCookie(response, {
      playerId: player.id,
      email: player.email,
      ign: player.ign,
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Onboarding failed. Internal database validation error." }, { status: 500 });
  }
}
