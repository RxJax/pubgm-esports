import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ReportUpdateSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json({ error: "Access Denied. Platform administrator permissions required." }, { status: 403 });
    }

    const body = await request.json();
    
    // Strict schema validation using Zod
    const result = ReportUpdateSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid report update payload";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { status } = result.data;

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
