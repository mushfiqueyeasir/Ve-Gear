"use server";

import { writeAuditLog } from "@/lib/admin/auditLog";
import type { UserRole } from "@/type/db";

/** Record admin auth events from the login page / shell (client → server). */
export async function logAdminAuthEvent(input: {
  type: "login" | "logout" | "login_failed";
  userId?: string | null;
  email: string;
  role?: UserRole | string | null;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email) return;

  if (input.type === "login_failed") {
    await writeAuditLog({
      action: "login_failed",
      entity: "auth",
      summary: `Failed admin login attempt for ${email}`,
      metadata: { email },
    });
    return;
  }

  const role = input.role ?? null;
  const actor =
    input.userId && email
      ? {
          userId: input.userId,
          email,
          role: (role as UserRole) || "viewer",
        }
      : null;

  await writeAuditLog({
    actor,
    action: input.type,
    entity: "auth",
    entityId: input.userId ?? null,
    summary:
      input.type === "login"
        ? `Admin signed in: ${email}`
        : `Admin signed out: ${email}`,
    metadata: { email, role },
  });
}
