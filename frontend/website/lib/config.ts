/**
 * App configuration mapped from config.json.
 * Public values are injected by next.config.ts from config.json into the build.
 * Do not import config.json here — that would risk bundling server secrets.
 */

export const appConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  email: {
    serviceId: process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID ?? "",
    contactTemplate: process.env.NEXT_PUBLIC_EMAIL_CONTACT_TEMPLATE ?? "",
    checkoutTemplate: process.env.NEXT_PUBLIC_EMAIL_CHECKOUT_TEMPLATE ?? "",
    publicKey: process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY ?? "",
    address: process.env.NEXT_PUBLIC_EMAIL_ADDRESS ?? "",
  },
  securityEnabled: process.env.SECURITY_ENABLED === "true",
} as const;
