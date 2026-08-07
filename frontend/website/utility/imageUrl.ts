import "server-only";

import { getSupabaseUrl } from "@/lib/config.server";
import { BUCKETS, type BucketName } from "@/lib/supabase/config";
import { buildStoragePublicUrl } from "@/utility/storageUrl";

// Resolve a Supabase Storage object path into a public URL.
// `path` is the object key within `bucket` (e.g. "abc/main.jpg").
// Works on both server and client (pure string construction, all buckets public).
export function storagePublicUrl(
  bucket: BucketName,
  path: string | null | undefined,
): string | null {
  return buildStoragePublicUrl(getSupabaseUrl(), bucket, path);
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
