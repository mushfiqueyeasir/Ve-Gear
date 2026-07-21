"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";

export interface ReviewInput {
  id?: string;
  customer_name: string | null;
  image_path: string | null;
  rating: number | null;
  body: string | null;
  product_id: string | null;
  is_published: boolean;
}

export async function saveReview(
  input: ReviewInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!input.customer_name || !input.customer_name.trim()) {
    return { error: "Customer name is required." };
  }
  if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
    return { error: "Rating must be between 1 and 5." };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    customer_name: input.customer_name.trim(),
    image_path: input.image_path,
    rating: input.rating,
    body: input.body,
    product_id: input.product_id,
    is_published: input.is_published,
  };

  const query = input.id
    ? supabase.from("reviews").update(payload).eq("id", input.id)
    : supabase.from("reviews").insert(payload);

  const { data, error } = await query.select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/admin/reviews");
  return { id: data.id as string };
}

export async function deleteReview(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
}

export async function toggleReview(
  id: string,
  isPublished: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
}
