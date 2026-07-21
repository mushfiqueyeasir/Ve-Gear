"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";

export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  const value = Number.isFinite(stock) ? Math.max(0, Math.trunc(stock)) : 0;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock_quantity: value, updated_at: new Date().toISOString() })
    .eq("id", variantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/inventory");
}

export async function updateVariantThreshold(
  variantId: string,
  threshold: number,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  const value = Number.isFinite(threshold)
    ? Math.max(0, Math.trunc(threshold))
    : 0;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      low_stock_threshold: value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/inventory");
}
