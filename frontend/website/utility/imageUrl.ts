import { BUCKETS, SUPABASE_URL, type BucketName } from "@/lib/supabase/config";

// Resolve a Supabase Storage object path into a public URL.
// `path` is the object key within `bucket` (e.g. "abc/main.jpg").
// Works on both server and client (pure string construction, all buckets public).
export function storagePublicUrl(
  bucket: BucketName,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  // Already an absolute URL (e.g. legacy/imported data) — pass through.
  if (/^https?:\/\//i.test(path)) return path;
  const base = SUPABASE_URL.replace(/\/$/, "");
  if (!base) return null;
  const clean = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${clean}`;
}

export const productImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.product, p);
export const categoryImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.category, p);
export const reviewImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.review, p);
export const promotionImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.promotion, p);
export const brandingImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.branding, p);
export const bannerImageUrl = (p?: string | null) =>
  storagePublicUrl(BUCKETS.banner, p);
