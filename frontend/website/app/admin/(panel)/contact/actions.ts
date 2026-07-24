"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/auditLog";

export async function toggleRead(
  id: string,
  isRead: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: submissionRow } = await supabase
    .from("contact_submissions")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("contact_submissions")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) return { error: error.message };

  const submitter = submissionRow?.name?.trim() || id;
  await writeAuditLog({
    actor: s,
    action: "update",
    entity: "contact",
    entityId: id,
    summary: isRead
      ? `Marked contact submission from ${submitter} as read`
      : `Marked contact submission from ${submitter} as unread`,
    metadata: { is_read: isRead },
  });

  revalidatePath("/admin/contact");
}

export async function deleteSubmission(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: submissionRow } = await supabase
    .from("contact_submissions")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog({
    actor: s,
    action: "delete",
    entity: "contact",
    entityId: id,
    summary: submissionRow?.name
      ? `Deleted contact submission from ${submissionRow.name}`
      : `Deleted contact submission ${id}`,
  });

  revalidatePath("/admin/contact");
}
