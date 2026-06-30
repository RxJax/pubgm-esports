import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password credentials" }, { status: 400 });
    }

    // Lookup user in SQLite
    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      return NextResponse.json({ error: "Invalid credentials: Player not found" }, { status: 401 });
    }

    // Compare hash
    const passwordMatch = await bcrypt.compare(password, player.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials: Password incorrect" }, { status: 401 });
    }

    // Set JWT cookie and respond
    const response = NextResponse.json({ success: true, player: { id: player.id, ign: player.ign } });
    return setAuthCookie(response, {
      playerId: player.id,
      email: player.email,
      ign: player.ign,
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Login failed. Internal error." }, { status: 500 });
  }
}
