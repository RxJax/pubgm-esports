import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static resources, API endpoints, auth routes, and maintenance screen
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/maintenance" ||
    pathname === "/login"
  ) {
    return createClient(request);
  }

  // 2. Decode the JWT token from the cookie to check admin status
  const token = request.cookies.get("auth-token")?.value;
  let isAdmin = false;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        isAdmin = payload.email?.toLowerCase() === "rxjax007@gmail.com";
      }
    } catch (e) {
      // Ignore malformed tokens
    }
  }

  // 3. Authenticated admin sessions bypass maintenance mode checks entirely
  if (isAdmin) {
    return createClient(request);
  }

  // 4. Query maintenance mode status via internal API endpoint (runs in Node.js runtime)
  try {
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const res = await fetch(`${protocol}://${host}/api/maintenance`, {
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.maintenanceActive) {
        // Redirect public visitors to the maintenance screen
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  } catch (error) {
    console.error("Middleware maintenance check failed:", error);
  }

  return createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - static resources (css, js, media)
     * - favicon, images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
export const revalidate = 0;
