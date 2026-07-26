import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import type { PromoCodeRow } from "@/type/db";
import { PromoCodesTable } from "./PromoCodesTable";
import { PromoCodeDialog } from "./PromoCodeDialog";

export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = ((data as PromoCodeRow[] | null) ?? []).map((row) => ({
    ...row,
    percent: Number(row.percent),
  }));

  return (
    <div>
      <PageHeader
        title="Promo codes"
        description={
          error
            ? "Could not load promo codes. Apply migration 0014_promo_codes.sql if the table is missing."
            : "Flat percent discounts for checkout. Applied to the order subtotal — delivery is excluded."
        }
      >
        {writable ? <PromoCodeDialog /> : null}
      </PageHeader>
      <PromoCodesTable data={rows} canWrite={writable} />
    </div>
  );
}
