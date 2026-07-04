import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { RosterActionSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string };
    const isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Administrator permissions required." }, { status: 403 });
    }

    // Query pending and approved rosters
    const rosters = await prisma.teamRoster.findMany({
      where: {
        status: { in: ["PENDING", "APPROVED"] },
      },
      include: {
        organization: {
          select: {
            name: true,
            email: true,
            logoUrl: true,
          },
        },
        players: {
          select: {
            id: true,
            ign: true,
            role: true,
            avatarUrl: true,
            region: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rosters);
  } catch (error: any) {
    console.error("Failed to fetch pending rosters:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string };
    const isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access denied. Administrator permissions required." }, { status: 403 });
    }

    const body = await request.json();
    const result = RosterActionSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid roster action data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { id, status } = result.data;

    // Update roster status
    const updatedRoster = await prisma.teamRoster.update({
      where: { id },
      data: {
        status,
      },
    });

    return NextResponse.json({ success: true, roster: updatedRoster });
  } catch (error: any) {
    console.error("Failed to update roster status:", error);
    return NextResponse.json({ error: "Failed to perform roster action." }, { status: 500 });
  }
}
