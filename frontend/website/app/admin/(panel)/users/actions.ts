"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession, isAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/auditLog";
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

  await writeAuditLog({
    actor: s,
    action: "create",
    entity: "user",
    entityId: userId,
    summary: `Created user ${email}`,
    metadata: { role: input.role },
  });

  revalidatePath("/admin/users");
  return {};
}

// Update a staff user (email, name, role, optional password).
export async function updateUser(input: {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
}): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage users." };
  }

  const userId = input.userId?.trim();
  if (!userId) return { error: "User is required." };

  const email = input.email.trim().toLowerCase();
  if (!email) return { error: "Email is required." };
  if (!ROLES.includes(input.role)) return { error: "Invalid role." };
  if (userId === s.userId && input.role !== s.role) {
    return { error: "You cannot change your own role." };
  }
  if (input.password && input.password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const admin = createSupabaseAdminClient();
  const fullName = input.fullName.trim() || null;

  const authPatch: {
    email: string;
    user_metadata: { full_name: string | null };
    password?: string;
  } = {
    email,
    user_metadata: { full_name: fullName },
  };
  if (input.password) authPatch.password = input.password;

  const { error: authError } = await admin.auth.admin.updateUserById(
    userId,
    authPatch,
  );
  if (authError) return { error: authError.message };

  const profilePatch: {
    full_name: string | null;
    role?: UserRole;
    updated_at: string;
  } = {
    full_name: fullName,
    updated_at: new Date().toISOString(),
  };
  if (userId !== s.userId) {
    profilePatch.role = input.role;
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update(profilePatch)
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  await writeAuditLog({
    actor: s,
    action: "update",
    entity: "user",
    entityId: userId,
    summary: input.password
      ? `Updated user ${email} (password changed)`
      : `Updated user ${email}`,
    metadata: {
      role: profilePatch.role ?? s.role,
      ...(input.password ? { password_changed: true } : {}),
    },
  });

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

  const { data: profileRow } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const userEmail = authUser?.user?.email ?? userId;
  const userLabel = profileRow?.full_name?.trim() || userEmail;

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  await writeAuditLog({
    actor: s,
    action: "delete",
    entity: "user",
    entityId: userId,
    summary: `Deleted user ${userLabel}`,
  });

  revalidatePath("/admin/users");
  return {};
}
