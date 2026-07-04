import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dynamic from "next/dynamic";
import DatabaseErrorCard from "@/app/components/DatabaseErrorCard";

const OrgProfileClient = dynamic(() => import("@/app/components/OrgProfileClient"), {
  loading: () => (
    <div className="min-h-screen bg-gaming-black flex items-center justify-center text-xs font-black text-gray-500 uppercase tracking-widest">
      Loading Organization Profile...
    </div>
  ),
});

export const revalidate = 0;

interface OrgPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { id } = await params;

  let org = null;
  let dbError = false;

  try {
    org = await prisma.organization.findUnique({
      where: { id },
      include: {
        rosters: {
          where: { status: "APPROVED" },
          include: {
            players: {
              select: {
                id: true,
                ign: true,
                role: true,
                avatarUrl: true,
                region: true,
                urRank: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    dbError = true;
  }

  if (dbError) {
    return <DatabaseErrorCard />;
  }

  if (!org) {
    notFound();
  }

  // Check if owner
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let isOwner = false;

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
      const decoded = jwt.verify(token, JWT_SECRET) as { orgId?: string; role?: string };
      if (decoded.orgId === org.id && decoded.role === "organization") {
        isOwner = true;
      }
    } catch (e) {
      // Ignore invalid token
    }
  }

  return <OrgProfileClient organization={org} isOwner={isOwner} />;
}
