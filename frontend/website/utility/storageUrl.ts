import type { BucketName } from "@/lib/supabase/config";

export function buildStoragePublicUrl(
  baseUrl: string,
  bucket: BucketName,
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = baseUrl.replace(/\/$/, "");
  if (!base) return null;
  const clean = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${clean}`;
}
