"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";

export interface PromotionInput {
  id?: string;
  title: string;
  description: string | null;
  image_path: string | null;
  discount_percent: number | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export async function savePromotion(
  input: PromotionInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!input.title.trim()) return { error: "Title is required." };

  const supabase = await createSupabaseServerClient();
  const payload = {
    title: input.title.trim(),
    description: input.description,
    image_path: input.image_path,
    discount_percent: input.discount_percent,
    active: input.active,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? supabase.from("promotions").update(payload).eq("id", input.id)
    : supabase.from("promotions").insert(payload);

  const { data, error } = await query.select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/admin/promotions");
  return { id: data.id as string };
}

export async function deletePromotion(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/promotions");
}

export async function togglePromotion(
  id: string,
  active: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("promotions")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/promotions");
}
