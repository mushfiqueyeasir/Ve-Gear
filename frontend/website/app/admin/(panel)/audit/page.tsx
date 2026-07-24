import { requireRole } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import type { AuditLogRow } from "@/type/db";
import { AuditLogTable } from "./AuditLogTable";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requireRole(["admin"]);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, created_at, actor_id, actor_email, actor_role, action, entity, entity_id, summary, metadata",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const rows: AuditLogRow[] = ((data as AuditLogRow[] | null) ?? []).map(
    (row) => ({
      ...row,
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : {},
    }),
  );

  return (
    <div>
      <PageHeader
        title="Audit log"
        description={
          error
            ? "Could not load audit events. Apply migration 0013_audit_logs.sql if the table is missing."
            : "Security trail of admin changes and key storefront events. Showing the latest 500 entries."
        }
      />
      <AuditLogTable data={rows} />
    </div>
  );
}
