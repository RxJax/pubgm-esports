import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createMockClient = () => {
  console.warn("Supabase initialization skipped: Missing credentials");
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === "auth") {
        return new Proxy({}, {
          get(authTarget, authProp) {
            return () => Promise.resolve({ data: { user: null, session: null }, error: null });
          }
        });
      }
      return () => Promise.resolve({ data: null, error: new Error("Supabase is not initialized") });
    }
  });
};

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (!supabaseUrl || !supabaseKey) {
    return createMockClient();
  }
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
