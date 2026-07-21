import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import type { ContactSubmissionRow } from "@/type/db";
import { ContactTable } from "./ContactTable";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  const rows = (data ?? []) as ContactSubmissionRow[];
  const unread = rows.filter((r) => !r.is_read).length;

  const description =
    rows.length === 0
      ? "Messages submitted through your storefront contact form."
      : unread > 0
        ? `${unread} unread of ${rows.length} message${
            rows.length === 1 ? "" : "s"
          }.`
        : `All ${rows.length} message${rows.length === 1 ? "" : "s"} read.`;

  return (
    <div>
      <PageHeader title="Contact inbox" description={description} />
      <ContactTable data={rows} canWrite={writable} />
    </div>
  );
}
