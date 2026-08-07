export const appConfig = {
  siteUrl: process.env.SITE_URL ?? "",
  securityEnabled: process.env.SECURITY_ENABLED === "true",
} as const;
