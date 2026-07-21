import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { InventoryTable, type InventoryRow } from "./InventoryTable";

export const dynamic = "force-dynamic";

interface VariantQueryRow {
  id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  products: { title: string } | null;
}

export default async function InventoryPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("product_variants")
    .select(
      `id, size, color, sku, stock_quantity, low_stock_threshold,
       products ( title )`,
    )
    .order("stock_quantity", { ascending: true });

  const rows: InventoryRow[] = (
    (data ?? []) as unknown as VariantQueryRow[]
  ).map((v) => ({
    id: v.id,
    productTitle: v.products?.title ?? "Unknown product",
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock_quantity: v.stock_quantity,
    low_stock_threshold: v.low_stock_threshold,
  }));

  const lowCount = rows.filter(
    (r) => r.stock_quantity <= r.low_stock_threshold,
  ).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${rows.length} variants · ${lowCount} at or below their low-stock threshold.`}
      />
      <InventoryTable data={rows} canWrite={writable} />
    </div>
  );
}
