import { requireRole } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import type { BlockedIpRow } from "@/type/db";
import { BlockedIpsTable } from "./BlockedIpsTable";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireRole(["admin"]);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("blocked_ips")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data as BlockedIpRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        title="Security"
        description="Block IP addresses from accessing your storefront."
      />
      <BlockedIpsTable data={rows} />
    </div>
  );
}
