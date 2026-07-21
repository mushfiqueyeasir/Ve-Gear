// Shared Supabase config + storage bucket names.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const BUCKETS = {
  product: "product-images",
  category: "category-images",
  review: "review-images",
  promotion: "promotion-images",
  branding: "branding",
  banner: "banner-images",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env (run the provisioning script).",
    );
  }
}
