"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";

export interface CategoryInput {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  sort?: number;
  image_path?: string | null;
}

export async function saveCategory(
  input: CategoryInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  if (!input.name?.trim()) return { error: "Name is required." };
  if (!input.slug?.trim()) return { error: "Slug is required." };

  const supabase = await createSupabaseServerClient();

  let sort = Number.isFinite(input.sort) ? Number(input.sort) : undefined;
  if (sort == null) {
    if (input.id) {
      const { data: existing } = await supabase
        .from("categories")
        .select("sort")
        .eq("id", input.id)
        .maybeSingle();
      sort = (existing?.sort as number | undefined) ?? 0;
    } else {
      const { data: maxRow } = await supabase
        .from("categories")
        .select("sort")
        .order("sort", { ascending: false })
        .limit(1)
        .maybeSingle();
      sort = ((maxRow?.sort as number | undefined) ?? 0) + 10;
    }
  }

  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    sort,
    image_path: input.image_path || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("categories")
    .upsert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { id: data.id as string };
}

export async function deleteCategory(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!orderedIds.length) return { error: "Invalid category order." };

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("categories")
      .update({ sort: (i + 1) * 10, updated_at: now })
      .eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
