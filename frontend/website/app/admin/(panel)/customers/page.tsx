import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/utility/getSettings";
import { PageHeader } from "@/components/admin/PageHeader";
import { CustomersTable } from "./CustomersTable";
import type { CustomerRow } from "@/type/db";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();
  const [{ data: customers }, settings] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .order("total_spent", { ascending: false }),
    getSiteSettings(),
  ]);
  const symbol = settings.currency_symbol || "$";
  const rows = (customers as CustomerRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${rows.length} customer${rows.length === 1 ? "" : "s"}`}
      />
      <CustomersTable data={rows} symbol={symbol} />
    </div>
  );
}
