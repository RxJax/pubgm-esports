import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const region = searchParams.get("region") || "";
  const status = searchParams.get("status") || "";
  const minKdStr = searchParams.get("minKd") || "";
  const deviceType = searchParams.get("deviceType") || "";
  const gyro = searchParams.get("gyro") || "";
  const urRank = searchParams.get("urRank") || "";

  const where: any = {};
  const andConditions: any[] = [];

  // Text search on IGN or Character ID
  if (search) {
    andConditions.push({
      OR: [
        { ign: { contains: search } },
        { characterId: { contains: search } },
      ],
    });
  }

  // Basic filters
  if (role && role !== "All") {
    where.role = role;
  }

  if (region && region !== "All") {
    where.region = region;
  }

  if (status && status !== "All") {
    where.status = status;
  }

  if (urRank && urRank !== "All") {
    where.urRank = urRank;
  }

  if (minKdStr) {
    const minKd = parseFloat(minKdStr);
    if (!isNaN(minKd)) {
      where.kdRatio = { gte: minKd };
    }
  }

  // Device profile filter (Tablet vs Phone)
  if (deviceType === "tablet") {
    andConditions.push({
      OR: [
        { device: { contains: "iPad" } },
        { device: { contains: "Tablet" } },
      ],
    });
  } else if (deviceType === "phone") {
    andConditions.push({
      NOT: [
        { device: { contains: "iPad" } },
        { device: { contains: "Tablet" } },
      ],
    });
  }

  // Gyroscope profile filter (On vs Off)
  if (gyro === "on") {
    where.controlSetup = { contains: "gyro" };
  } else if (gyro === "off") {
    andConditions.push({
      NOT: [
        { controlSetup: { contains: "gyro" } },
      ],
    });
  }

  // Apply AND conditions if any are present
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  try {
    const players = await prisma.player.findMany({
      where,
      include: {
        team: true,
      },
      orderBy: {
        updatedAt: "desc", // Sort by most recently updated
      },
    });

    return NextResponse.json(players);
  } catch (error: any) {
    console.error("API GET players error:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
