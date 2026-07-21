import "server-only";

import { loadConfigFile } from "./loadConfig";

/** Server-only secrets from config.json (never import in client code). */
export function getSupabaseServiceRoleKey(): string {
  return loadConfigFile().SUPABASE_SERVICE_ROLE_KEY ?? "";
}
