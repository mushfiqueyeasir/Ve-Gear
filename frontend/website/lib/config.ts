/**
 * App configuration mapped from config.json.
 * Public values are injected by next.config.ts from config.json into the build.
 * Do not import config.json here — that would risk bundling server secrets.
 */

export const appConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  securityEnabled: process.env.SECURITY_ENABLED === "true",
} as const;
