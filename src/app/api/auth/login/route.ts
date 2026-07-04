import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Strict schema validation using Zod
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid login data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;

    // Lookup user in Player
    const player = await prisma.player.findUnique({
      where: { email },
    });

    if (player) {
      const passwordMatch = await bcrypt.compare(password, player.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Invalid credentials: Password incorrect" }, { status: 401 });
      }
      const response = NextResponse.json({ success: true, player: { id: player.id, ign: player.ign } });
      return setAuthCookie(response, {
        playerId: player.id,
        email: player.email,
        ign: player.ign,
        role: player.profileType || "Player",
      });
    }

    // Lookup user in Organization
    const org = await prisma.organization.findUnique({
      where: { email },
    });

    if (org) {
      const passwordMatch = await bcrypt.compare(password, org.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Invalid credentials: Password incorrect" }, { status: 401 });
      }
      const response = NextResponse.json({ success: true, organization: { id: org.id, name: org.name } });
      return setAuthCookie(response, {
        orgId: org.id,
        email: org.email,
        ign: org.name,
        role: "organization",
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Login failed. Internal error." }, { status: 500 });
  }
}
