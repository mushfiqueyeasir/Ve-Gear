"use server";

import { writeAuditLog } from "@/lib/admin/auditLog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/type/db";

type AuthResult = { error?: string };

export async function signInAdmin(
  emailInput: string,
  password: string,
): Promise<AuthResult> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await writeAuditLog({
      action: "login_failed",
      entity: "auth",
      summary: `Failed admin login attempt for ${email}`,
      metadata: { email },
    });
    return { error: error?.message || "Invalid credentials" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = (profile?.role as UserRole) ?? "viewer";

  await writeAuditLog({
    actor: {
      userId: data.user.id,
      email: data.user.email ?? email,
      role,
    },
    action: "login",
    entity: "auth",
    entityId: data.user.id,
    summary: `Admin signed in: ${data.user.email ?? email}`,
    metadata: { email: data.user.email ?? email, role },
  });

  return {};
}

export async function signOutAdmin(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = (profile?.role as UserRole) ?? "viewer";
    await writeAuditLog({
      actor: {
        userId: user.id,
        email: user.email ?? "",
        role,
      },
      action: "logout",
      entity: "auth",
      entityId: user.id,
      summary: `Admin signed out: ${user.email ?? "unknown"}`,
      metadata: { email: user.email ?? "", role },
    });
  }

  const { error } = await supabase.auth.signOut();
  return error ? { error: error.message } : {};
}
