import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const revalidate = 0;

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({
      maintenanceActive: config?.maintenanceActive ?? false,
    });
  } catch (e) {
    return NextResponse.json({ maintenanceActive: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string };
    const isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    if (!isAdmin) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const { maintenanceActive } = await request.json();
    if (typeof maintenanceActive !== "boolean") {
      return NextResponse.json({ error: "Invalid configuration type." }, { status: 400 });
    }

    const config = await prisma.systemConfig.upsert({
      where: { id: "default" },
      update: { maintenanceActive },
      create: { id: "default", maintenanceActive },
    });

    return NextResponse.json({
      success: true,
      maintenanceActive: config.maintenanceActive,
    });
  } catch (error: any) {
    console.error("Maintenance configuration update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update configuration" }, { status: 500 });
  }
}
