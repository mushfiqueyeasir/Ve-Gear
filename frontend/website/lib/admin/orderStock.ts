import type { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/type/db";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Statuses where deleting an order should put stock back (not yet shipped). */
export const RESTOCK_ON_DELETE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
];

/**
 * Add order line quantities back onto their product variants.
 * Aggregates duplicate variant lines before updating.
 */
export async function restockVariantsForOrders(
  supabase: ServerClient,
  orderIds: string[],
): Promise<{ error?: string }> {
  const ids = [...new Set(orderIds.filter(Boolean))];
  if (!ids.length) return {};

  const { data: items, error } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .in("order_id", ids);

  if (error) return { error: error.message };

  const qtyByVariant = new Map<string, number>();
  for (const raw of items ?? []) {
    if (!raw.variant_id) continue;
    const qty = Number(raw.quantity) || 0;
    if (qty <= 0) continue;
    qtyByVariant.set(
      raw.variant_id,
      (qtyByVariant.get(raw.variant_id) ?? 0) + qty,
    );
  }

  if (!qtyByVariant.size) return {};

  const variantIds = [...qtyByVariant.keys()];
  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .in("id", variantIds);

  if (vErr) return { error: vErr.message };

  for (const v of variants ?? []) {
    const add = qtyByVariant.get(v.id) ?? 0;
    if (!add) continue;
    const { error: uErr } = await supabase
      .from("product_variants")
      .update({
        stock_quantity: Math.max(0, (v.stock_quantity ?? 0) + add),
        updated_at: new Date().toISOString(),
      })
      .eq("id", v.id);
    if (uErr) return { error: uErr.message };
  }

  return {};
}
