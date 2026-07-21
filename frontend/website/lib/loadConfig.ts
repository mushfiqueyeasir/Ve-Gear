import { readFileSync } from "fs";
import { join } from "path";

export type AppConfigFile = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_EMAIL_SERVICE_ID?: string;
  NEXT_PUBLIC_EMAIL_CONTACT_TEMPLATE?: string;
  NEXT_PUBLIC_EMAIL_CHECKOUT_TEMPLATE?: string;
  NEXT_PUBLIC_EMAIL_PUBLIC_KEY?: string;
  NEXT_PUBLIC_EMAIL_ADDRESS?: string;
  SECURITY_ENABLED?: string | boolean;
};

/** Read config.json from the website project root (Node / build only). */
export function loadConfigFile(cwd = process.cwd()): AppConfigFile {
  const raw = readFileSync(join(cwd, "config.json"), "utf8");
  return JSON.parse(raw) as AppConfigFile;
}
