"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { toCsv, formatDate } from "@/lib/admin/format";
import type { OrderRow, ProductRow, ProductVariantRow } from "@/type/db";

// Orders export: order_number, date, status, customer name, phone, subtotal, shipping, total.
export async function exportOrdersCsv(): Promise<{
  csv?: string;
  error?: string;
}> {
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("orders")
    .select("order_number, status, delivery, totals, created_at")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const orders = (data as OrderRow[] | null) ?? [];
  const rows = orders.map((o) => ({
    order_number: o.order_number,
    date: formatDate(o.created_at),
    status: o.status,
    customer:
      [o.delivery?.firstName, o.delivery?.lastName].filter(Boolean).join(" ") ||
      "Guest",
    phone: o.delivery?.phone ?? "",
    subtotal: o.totals?.subtotal ?? 0,
    shipping: o.totals?.shipping ?? 0,
    total: o.totals?.total ?? 0,
  }));

  return { csv: toCsv(rows) };
}

// Products export: title, slug, status, current_price, original_price, total_stock.
export async function exportProductsCsv(): Promise<{
  csv?: string;
  error?: string;
}> {
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();

  const [{ data: products, error: pErr }, { data: variants, error: vErr }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, title, slug, status, current_price, original_price")
        .order("title", { ascending: true }),
      supabase.from("product_variants").select("product_id, stock_quantity"),
    ]);

  if (pErr) return { error: pErr.message };
  if (vErr) return { error: vErr.message };

  const stockByProduct = new Map<string, number>();
  for (const v of (variants as
    Pick<ProductVariantRow, "product_id" | "stock_quantity">[] | null) ?? []) {
    stockByProduct.set(
      v.product_id,
      (stockByProduct.get(v.product_id) ?? 0) + (v.stock_quantity ?? 0),
    );
  }

  const rows = ((products as ProductRow[] | null) ?? []).map((p) => ({
    title: p.title,
    slug: p.slug,
    status: p.status,
    current_price: p.current_price,
    original_price: p.original_price,
    total_stock: stockByProduct.get(p.id) ?? 0,
  }));

  return { csv: toCsv(rows) };
}
