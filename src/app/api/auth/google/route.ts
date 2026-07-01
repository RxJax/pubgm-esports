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

      // Generate JWT cookie session and return response
      const response = NextResponse.json({
        success: true,
        player: { id: player.id, ign: player.ign, email: player.email },
      });

      return setAuthCookie(response, {
        playerId: player.id,
        email: player.email,
        ign: player.ign,
      });
    } else {
      console.log(`Google Signup: Onboarding required for email ${email}`);
      return NextResponse.json({
        onboardingRequired: true,
        email,
        name,
      });
    }
  } catch (error: any) {
    console.error("Google Login API error:", error);
    return NextResponse.json({ error: "Google authentication failed. Internal server error." }, { status: 500 });
  }
}
