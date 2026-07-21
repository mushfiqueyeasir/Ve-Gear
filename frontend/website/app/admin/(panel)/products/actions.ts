"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";

export interface ProductImageInput {
  path: string;
  alt?: string | null;
  isMain?: boolean;
}

export interface ProductVariantInput {
  id?: string;
  size?: string | null;
  color?: string | null;
  sku?: string | null;
  price_override?: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface ProductSizeChartInput {
  size: string;
  chest: string;
  length: string;
}

export interface ProductInput {
  id?: string;
  title: string;
  slug: string;
  status: "active" | "draft" | "archived";
  product_type?: string | null;
  original_price: number;
  current_price: number;
  description: { html: string } | null;
  size_chart: ProductSizeChartInput[] | null;
  categoryIds: string[];
  images: ProductImageInput[];
  variants: ProductVariantInput[];
}

export async function saveProduct(
  input: ProductInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  if (!input.title?.trim()) return { error: "Title is required." };
  if (!input.slug?.trim()) return { error: "Slug is required." };

  const supabase = await createSupabaseServerClient();

  // Keep existing sort on edit; append new products at the end (when sort exists).
  let nextSort: number | undefined;
  if (!input.id) {
    const { data: maxRow, error: sortProbe } = await supabase
      .from("products")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sortProbe) {
      nextSort = ((maxRow?.sort as number | undefined) ?? 0) + 10;
    }
  }

  // 1. Upsert the product row.
  const sizeChart =
    input.size_chart && input.size_chart.length > 0
      ? input.size_chart.map((row) => ({
          size: row.size.trim(),
          chest: String(row.chest).trim(),
          length: String(row.length).trim(),
        }))
      : null;

  const productPayload = {
    ...(input.id ? { id: input.id } : {}),
    title: input.title.trim(),
    slug: input.slug.trim(),
    status: input.status,
    product_type: input.product_type?.trim() || null,
    original_price: Number(input.original_price) || 0,
    current_price: Number(input.current_price) || 0,
    description: input.description,
    size_chart: sizeChart,
    ...(nextSort != null ? { sort: nextSort } : {}),
    updated_at: new Date().toISOString(),
  };

  let { data: product, error: productError } = await supabase
    .from("products")
    .upsert(productPayload)
    .select("id")
    .single();

  // Fallback if size_chart column isn't migrated yet.
  if (productError && /size_chart/i.test(productError.message)) {
    const withoutChart = { ...productPayload };
    delete (withoutChart as { size_chart?: unknown }).size_chart;
    ({ data: product, error: productError } = await supabase
      .from("products")
      .upsert(withoutChart)
      .select("id")
      .single());
  }

  if (productError) return { error: productError.message };
  const productId = product.id as string;

  // 2. Sync images (delete-all + re-insert reflects the desired end state).
  const { error: delImgError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (delImgError) return { error: delImgError.message };

  if (input.images.length) {
    const hasMain = input.images.some((img) => img.isMain);
    const imageRows = input.images.map((img, i) => ({
      product_id: productId,
      path: img.path,
      alt: img.alt ?? null,
      is_main: img.isMain ?? (!hasMain && i === 0),
      sort: i,
    }));
    const { error } = await supabase.from("product_images").insert(imageRows);
    if (error) return { error: error.message };
  }

  // 3. Sync category links (delete + insert).
  const { error: delCatError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (delCatError) return { error: delCatError.message };

  if (input.categoryIds.length) {
    const catRows = input.categoryIds.map((category_id) => ({
      product_id: productId,
      category_id,
    }));
    const { error } = await supabase
      .from("product_categories")
      .insert(catRows);
    if (error) return { error: error.message };
  }

  // 4. Sync variants: delete removed ones, then upsert the rest.
  const keepIds = input.variants
    .map((v) => v.id)
    .filter((id): id is string => Boolean(id));

  const { data: existing } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  const toDelete = ((existing ?? []) as { id: string }[])
    .filter((e) => !keepIds.includes(e.id))
    .map((e) => e.id);

  if (toDelete.length) {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .in("id", toDelete);
    if (error) return { error: error.message };
  }

  if (input.variants.length) {
    const variantRows = input.variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      product_id: productId,
      size: v.size?.trim() || null,
      color: v.color?.trim() || null,
      sku: v.sku?.trim() || null,
      price_override:
        v.price_override === null || v.price_override === undefined
          ? null
          : Number(v.price_override),
      stock_quantity: Number(v.stock_quantity) || 0,
      low_stock_threshold: Number(v.low_stock_threshold) || 0,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("product_variants")
      .upsert(variantRows);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/product");
  revalidatePath(`/product/${input.slug.trim()}`);
  return { id: productId };
}

export async function deleteProduct(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role))
    return { error: "You do not have permission to do this." };

  const supabase = await createSupabaseServerClient();
  // product_images / product_variants / product_categories cascade on delete.
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function reorderProducts(
  orderedIds: string[],
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!orderedIds.length) return { error: "Invalid product order." };

  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("products")
      .update({ sort: (i + 1) * 10, updated_at: now })
      .eq("id", orderedIds[i]);
    if (error) {
      if (/column .*sort.* does not exist/i.test(error.message)) {
        return {
          error:
            "Product ordering needs a database update. Run migration 0009_product_sort.sql.",
        };
      }
      return { error: error.message };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/product");
}
