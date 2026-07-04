import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "@/lib/auth";
import { OrganizationRegisterSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Strict schema validation using Zod
    const result = OrganizationRegisterSchema.safeParse(body);
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password, name, logoUrl } = result.data;

    // Check duplicate email across Player and Organization tables
    const existingPlayer = await prisma.player.findUnique({ where: { email } });
    const existingOrg = await prisma.organization.findUnique({ where: { email } });

    if (existingPlayer || existingOrg) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Organization
    const org = await prisma.organization.create({
      data: {
        email,
        password: hashedPassword,
        name,
        logoUrl: logoUrl || null,
      },
    });

    // Sign session and return cookie response
    const response = NextResponse.json({ success: true, organization: { id: org.id, name: org.name } });
    return setAuthCookie(response, {
      orgId: org.id,
      email: org.email,
      ign: org.name,
      role: "organization",
    });
  } catch (error: any) {
    console.error("Organization registration failed:", error);
    return NextResponse.json({ error: "Registration failed. Internal error." }, { status: 500 });
  }
}
