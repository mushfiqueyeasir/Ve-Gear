import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/config.server";
import { SUPABASE_URL } from "./config";
import { noStoreFetch } from "./noStoreFetch";

// Service-role client. Bypasses RLS — server-only, never import in client code.
// Used for storefront order writes (place_order RPC) and privileged admin ops.
// Always uses cache: "no-store" so admin/store reads stay fresh.
export function createSupabaseAdminClient() {
  const serviceKey = getSupabaseServiceRoleKey();
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in config.json.",
    );
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: noStoreFetch },
  });
}
