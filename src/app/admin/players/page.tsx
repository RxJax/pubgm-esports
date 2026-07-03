import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminPlayersClient from "@/app/components/AdminPlayersClient";

export const revalidate = 0; // Dynamic rendering

export default async function AdminPlayersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let isAdmin = false;
  let adminId = "";
  let adminIgn = "";
  let adminEmail = "";

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "pubgm-esports-super-secret-key-2026";
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role?: string; playerId?: string; ign?: string };
    isAdmin = decoded.email?.toLowerCase() === "rxjax007@gmail.com";
    adminId = decoded.playerId || "";
    adminIgn = decoded.ign || "Admin";
    adminEmail = decoded.email || "";
  } catch (e) {
    redirect("/login");
  }

  if (!isAdmin) {
    redirect("/404");
  }

  return (
    <main className="min-h-screen bg-gaming-black flex flex-col">
      <AdminPlayersClient
        adminId={adminId}
        adminIgn={adminIgn}
        adminEmail={adminEmail}
      />
    </main>
  );
}
