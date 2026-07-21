import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/utility/getSettings";
import { PageHeader } from "@/components/admin/PageHeader";
import { OrdersTable, type OrderTableRow } from "./OrdersTable";
import type { OrderRow } from "@/type/db";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const [{ data: orders }, settings] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, status, delivery, totals, created_at")
      .order("created_at", { ascending: false }),
    getSiteSettings(),
  ]);
  const symbol = settings.currency_symbol || "$";

  const rows: OrderTableRow[] = ((orders as OrderRow[] | null) ?? []).map(
    (o) => ({
      id: o.id,
      order_number: o.order_number,
      customer:
        [o.delivery?.firstName, o.delivery?.lastName]
          .filter(Boolean)
          .join(" ") || "Guest",
      created_at: o.created_at,
      status: o.status,
      total: o.totals?.total ?? 0,
    }),
  );

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${rows.length} order${rows.length === 1 ? "" : "s"} total`}
      />
      <OrdersTable data={rows} symbol={symbol} />
    </div>
  );
}
