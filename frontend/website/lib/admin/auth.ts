import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/type/db";

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string | null;
}

// Loads the signed-in user and their profile role. Returns null if unauthenticated.
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    role: (profile?.role as UserRole) ?? "viewer",
    fullName: (profile?.full_name as string | null) ?? null,
  };
}

// Requires a signed-in user; redirects to login otherwise.
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

// Requires one of the allowed roles; redirects to the dashboard if not allowed.
export async function requireRole(allowed: UserRole[]): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (!allowed.includes(session.role)) redirect("/admin?denied=1");
  return session;
}

export const canWrite = (role: UserRole) =>
  role === "admin" || role === "editor";
export const isAdmin = (role: UserRole) => role === "admin";
