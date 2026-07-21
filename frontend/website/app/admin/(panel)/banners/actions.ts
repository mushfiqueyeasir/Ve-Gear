"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import {
  newId,
  readCmsBlob,
  tableExists,
  writeCmsBlob,
} from "@/lib/cms/jsonStore";
import type { BannerRow } from "@/type/db";

export interface BannerInput {
  id?: string;
  title: string | null;
  subtitle: string | null;
  image_path: string | null;
  mobile_image_path: string | null;
  cta_label: string | null;
  cta_url: string | null;
  /** Omit to keep existing order (edit) or append at end (create). */
  sort?: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

function revalidate() {
  revalidatePath("/admin/banners");
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function listBanners(): Promise<BannerRow[]> {
  if (await tableExists("banners")) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false });
    return (data ?? []) as BannerRow[];
  }
  const cms = await readCmsBlob();
  return [...cms.banners].sort((a, b) => a.sort - b.sort);
}

export async function saveBanner(
  input: BannerInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!input.image_path) return { error: "A banner image is required." };
  if (!input.title?.trim()) {
    return { error: "A headline is required for every banner slide." };
  }

  const now = new Date().toISOString();
  const existing = await listBanners();
  const previous = input.id
    ? existing.find((b) => b.id === input.id)
    : undefined;
  const maxSort = existing.reduce((m, b) => Math.max(m, b.sort), 0);
  const sort =
    typeof input.sort === "number" && Number.isFinite(input.sort)
      ? input.sort
      : previous
        ? previous.sort
        : maxSort + 10;

  const payload = {
    title: input.title!.trim(),
    subtitle: input.subtitle,
    image_path: input.image_path,
    mobile_image_path: input.mobile_image_path,
    cta_label: input.cta_label,
    cta_url: input.cta_url,
    sort,
    active: input.active,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    updated_at: now,
  };

  if (await tableExists("banners")) {
    const supabase = await createSupabaseServerClient();
    const query = input.id
      ? supabase.from("banners").update(payload).eq("id", input.id)
      : supabase.from("banners").insert(payload);
    const { data, error } = await query.select("id").single();
    if (error) return { error: error.message };
    revalidate();
    return { id: data.id as string };
  }

  const cms = await readCmsBlob();
  const id = input.id || newId();
  const row: BannerRow = {
    id,
    ...payload,
    image_path: input.image_path!,
    created_at: cms.banners.find((b) => b.id === id)?.created_at ?? now,
  };
  const idx = cms.banners.findIndex((b) => b.id === id);
  if (idx >= 0) cms.banners[idx] = row;
  else cms.banners.push(row);
  const res = await writeCmsBlob(cms);
  if (res.error) return { error: res.error };
  revalidate();
  return { id };
}

export async function deleteBanner(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  if (await tableExists("banners")) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return { error: error.message };
  } else {
    const cms = await readCmsBlob();
    cms.banners = cms.banners.filter((b) => b.id !== id);
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }
  revalidate();
}

export async function toggleBanner(
  id: string,
  active: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  if (await tableExists("banners")) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("banners")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const cms = await readCmsBlob();
    cms.banners = cms.banners.map((b) =>
      b.id === id ? { ...b, active, updated_at: new Date().toISOString() } : b,
    );
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }
  revalidate();
}

export async function reorderBanners(
  orderedIds: string[],
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const rows = await listBanners();
  if (
    orderedIds.length !== rows.length ||
    !orderedIds.every((id) => rows.some((r) => r.id === id))
  ) {
    return { error: "Invalid slide order." };
  }

  const now = new Date().toISOString();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const next = orderedIds.map((id, index) => ({
    ...byId.get(id)!,
    sort: (index + 1) * 10,
    updated_at: now,
  }));

  if (await tableExists("banners")) {
    const supabase = await createSupabaseServerClient();
    for (const row of next) {
      const { error } = await supabase
        .from("banners")
        .update({ sort: row.sort, updated_at: now })
        .eq("id", row.id);
      if (error) return { error: error.message };
    }
  } else {
    const cms = await readCmsBlob();
    cms.banners = next;
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }

  revalidate();
}
