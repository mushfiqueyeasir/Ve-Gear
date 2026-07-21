import type { NextConfig } from "next";
import { loadConfigFile } from "./lib/loadConfig";

const config = loadConfigFile(process.cwd());

// Allow Supabase Storage public URLs as Next/Image sources.
// Covers <project-ref>.supabase.co and self-hosted hosts via config.json.
const supabaseHost = (() => {
  try {
    return config.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(config.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  // Map public config.json values into the Next.js env so client + server
  // code can read them via lib/config.ts (appConfig).
  env: {
    NEXT_PUBLIC_SUPABASE_URL: config.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: config.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_SITE_URL: config.NEXT_PUBLIC_SITE_URL ?? "",
    NEXT_PUBLIC_EMAIL_SERVICE_ID: config.NEXT_PUBLIC_EMAIL_SERVICE_ID ?? "",
    NEXT_PUBLIC_EMAIL_CONTACT_TEMPLATE:
      config.NEXT_PUBLIC_EMAIL_CONTACT_TEMPLATE ?? "",
    NEXT_PUBLIC_EMAIL_CHECKOUT_TEMPLATE:
      config.NEXT_PUBLIC_EMAIL_CHECKOUT_TEMPLATE ?? "",
    NEXT_PUBLIC_EMAIL_PUBLIC_KEY: config.NEXT_PUBLIC_EMAIL_PUBLIC_KEY ?? "",
    NEXT_PUBLIC_EMAIL_ADDRESS: config.NEXT_PUBLIC_EMAIL_ADDRESS ?? "",
    SECURITY_ENABLED: String(config.SECURITY_ENABLED ?? "false"),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
