"use server";

import { randomUUID } from "node:crypto";
import { requireRole } from "@/lib/admin/auth";
import { BUCKETS, type BucketName } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type UploadRequest = {
  bucket: BucketName;
  contentType: string;
  size: number;
};

type UploadResult = {
  path?: string;
  signedUrl?: string;
  error?: string;
};

export async function createImageUploadUrl(
  input: UploadRequest,
): Promise<UploadResult> {
  await requireRole(["admin", "editor"]);

  if (!Object.values(BUCKETS).includes(input.bucket)) {
    return { error: "Unknown storage bucket." };
  }
  const extension = EXTENSIONS[input.contentType.toLowerCase()];
  if (!extension) return { error: "Unsupported image type." };
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { error: "The image is empty." };
  }
  if (input.size > MAX_UPLOAD_BYTES) {
    return { error: "Images must be 10 MB or smaller." };
  }

  const path = `${randomUUID()}.${extension}`;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(input.bucket)
    .createSignedUploadUrl(path);

  if (error || !data?.signedUrl) {
    return { error: error?.message || "Could not authorize the upload." };
  }
  return { path, signedUrl: data.signedUrl };
}
