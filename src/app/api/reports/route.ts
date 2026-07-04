import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ReportSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Strict schema validation using Zod
    const result = ReportSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid report payload";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { reportedProfileId, reasonCategory, additionalDetails } = result.data;

    // Check if the reported profile exists
    const playerExists = await prisma.player.findUnique({
      where: { id: reportedProfileId },
    });
    if (!playerExists) {
      return NextResponse.json({ error: "Reported profile not found." }, { status: 404 });
    }

    // Try to get logged in reporter ID from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    let reporterId: string | null = null;

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
        const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };
        reporterId = decoded.playerId;
      } catch (e) {
        // ignore invalid token, fallback to anonymous
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedProfileId,
        reasonCategory,
        additionalDetails: additionalDetails || "",
        status: "PENDING",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}
