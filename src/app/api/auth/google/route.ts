import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: "Missing Google authentication credential token" }, { status: 400 });
    }

    // 1. Verify the ID token via Google's secure OAuth2 tokeninfo endpoint
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const verifyRes = await fetch(googleVerifyUrl);

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Google OAuth token verification failed. The token is invalid or has expired." }, { status: 400 });
    }

    const payload = await verifyRes.json();
    const { email, name, aud } = payload;

    if (!email) {
      return NextResponse.json({ error: "Google account does not contain a verified email address." }, { status: 400 });
    }

    // 2. Validate Google client ID audience matches our environment configuration (if set)
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && aud !== googleClientId) {
      console.warn(`Security Warning: Google login audience mismatch. Received: ${aud}, Expected: ${googleClientId}`);
      return NextResponse.json({ error: "Google OAuth security verification failed: Audience client ID mismatch." }, { status: 400 });
    }

    // 3. Lookup user in SQLite database
    let player = await prisma.player.findUnique({
      where: { email },
    });

    let isNew = false;

    if (player) {
      console.log(`Google Login: Recovered profile card for existing player ${email} (IGN: ${player.ign})`);
    } else {
      console.log(`Google Signup: Creating new player profile card for email ${email}`);
      isNew = true;

      // Create a clean new player profile card in the database
      const dummyPassword = await bcrypt.hash(`google-oauth-dummy-pw-${Date.now()}`, 10);
      const generatedIgn = name ? name.replace(/\s+/g, "_") : `Google_Player_${Math.floor(100 + Math.random() * 900)}`;
      const randomCharId = `8${Math.floor(100000000 + Math.random() * 900000000)}`; // Random 10-digit number starting with 8

      player = await prisma.player.create({
        data: {
          email,
          password: dummyPassword,
          ign: generatedIgn,
          characterId: randomCharId,
          region: "North America",
          bio: "New player onboarded via Google login. Complete your portfolio details inside the dashboard.",
          status: "Looking For Team",
          role: "Entry Fragger",
          device: "iPhone 15 Pro",
          controlSetup: "4-finger claw, gyro always-on",
          kdRatio: 0.0,
          headshotPct: 0.0,
          winRate: 0.0,
          matchesPlayed: 0,
          urRank: "Vanguard",
          urPoints: 1000,
        },
      });
    }

    // 4. Generate JWT cookie session and return response
    const response = NextResponse.json({
      success: true,
      isNew,
      player: { id: player.id, ign: player.ign, email: player.email },
    });

    return setAuthCookie(response, {
      playerId: player.id,
      email: player.email,
      ign: player.ign,
    });
  } catch (error: any) {
    console.error("Google Login API error:", error);
    return NextResponse.json({ error: "Google authentication failed. Internal server error." }, { status: 500 });
  }
}
