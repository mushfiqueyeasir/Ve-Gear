"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession, isAdmin } from "@/lib/admin/auth";
import type { UserRole } from "@/type/db";

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

// Create a new staff/auth user, then set their profile role + name.
export async function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage users." };
  }

  const email = input.email.trim().toLowerCase();
  if (!email) return { error: "Email is required." };
  if (!input.password || input.password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (!ROLES.includes(input.role)) return { error: "Invalid role." };

  const admin = createSupabaseAdminClient();
  const fullName = input.fullName.trim() || null;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) return { error: error.message };
  const userId = data.user?.id;
  if (!userId) return { error: "Failed to create user." };

  // A DB trigger creates the profile; upsert to set role + name reliably.
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: userId, full_name: fullName, role: input.role });

  if (profileError) return { error: profileError.message };

  revalidatePath("/admin/users");
  return {};
}

// Change a user's role. An admin cannot change their own role.
export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage users." };
  }
  if (!ROLES.includes(role)) return { error: "Invalid role." };
  if (userId === s.userId) {
    return { error: "You cannot change your own role." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

// Delete a user (auth + cascading profile). An admin cannot delete themselves.
export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage users." };
  }
  if (userId === s.userId) {
    return { error: "You cannot delete your own account." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}
