import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { noStoreFetch } from "./noStoreFetch";

// SSR Supabase client bound to the request cookies. Use in Server Components,
// Route Handlers, and Server Actions. In pure Server Components cookie writes
// are not allowed, so setAll is wrapped defensively.
// Always uses cache: "no-store" — catalog/CMS data changes frequently.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: noStoreFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
}
