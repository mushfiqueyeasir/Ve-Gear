import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Supabase Free includes 1 GB of file storage per project.
export const FREE_STORAGE_QUOTA_BYTES = 1_000_000_000;

export interface StorageUsage {
  available: boolean;
  usedBytes: number;
  quotaBytes: number;
  objectCount: number;
}

const LIST_PAGE_SIZE = 1_000;

async function getBucketUsage(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  bucket: string,
) {
  let usedBytes = 0;
  let objectCount = 0;

  async function walk(prefix: string): Promise<void> {
    let offset = 0;

    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      if (!data?.length) return;

      for (const item of data) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        const isFolder = item.id == null && !item.metadata;
        if (isFolder) {
          await walk(path);
          continue;
        }

        const size = Number(item.metadata?.size ?? 0);
        if (Number.isFinite(size)) usedBytes += Math.max(0, size);
        objectCount += 1;
      }

      if (data.length < LIST_PAGE_SIZE) return;
      offset += LIST_PAGE_SIZE;
    }
  }

  await walk("");
  return { usedBytes, objectCount };
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const fallback: StorageUsage = {
    available: false,
    usedBytes: 0,
    quotaBytes: FREE_STORAGE_QUOTA_BYTES,
    objectCount: 0,
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const usage = await Promise.all(
      (buckets ?? []).map((bucket) => getBucketUsage(supabase, bucket.id)),
    );
    const usedBytes = usage.reduce((sum, item) => sum + item.usedBytes, 0);
    const objectCount = usage.reduce((sum, item) => sum + item.objectCount, 0);

    return {
      available: true,
      usedBytes,
      quotaBytes: FREE_STORAGE_QUOTA_BYTES,
      objectCount,
    };
  } catch {
    return fallback;
  }
}
