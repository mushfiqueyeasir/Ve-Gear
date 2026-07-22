import "server-only";

import { loadConfigFile } from "./loadConfig";

/** Server-only secrets from config.json (never import in client code). */
export function getSupabaseServiceRoleKey(): string {
  return loadConfigFile().SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function getGmailCredentials(): {
  user: string;
  appPassword: string;
} {
  const config = loadConfigFile();
  return {
    user: (config.GMAIL_USER ?? "").trim(),
    appPassword: (config.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, ""),
  };
}

/** Store-owner inbox(es) that receive new-order alerts. */
export function getOrderNotifyEmails(): string[] {
  const raw = loadConfigFile().ORDER_NOTIFY_EMAILS;
  if (Array.isArray(raw)) {
    return raw.map((e) => String(e).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }
  return [];
}
