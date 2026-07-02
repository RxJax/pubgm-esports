import { createBrowserClient } from "@supabase/ssr";

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

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    return createMockClient();
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
