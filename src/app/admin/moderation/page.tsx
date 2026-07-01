import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import AdminModerationClient from "@/app/components/AdminModerationClient";

export const revalidate = 0; // Dynamic rendering

export default async function AdminModerationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let isAdmin = false;
  let adminId = "";
  let adminIgn = "";
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string; playerId?: string; ign?: string };
    isAdmin = decoded.email?.includes("admin") || decoded.role === "admin";
    adminId = decoded.playerId || "";
    adminIgn = decoded.ign || "Admin";
  } catch (e) {
    redirect("/login");
  }

  if (!isAdmin) {
    notFound(); // Throws the 404 Access Denied screen
  }

  // Fetch pending reports
  const pendingReports = await prisma.report.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      reportedPlayer: {
        select: {
          id: true,
          ign: true,
          characterId: true,
          avatarUrl: true,
          role: true,
          region: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <AdminModerationClient
        initialReports={pendingReports}
        adminId={adminId}
        adminIgn={adminIgn}
      />
    </main>
  );
}
