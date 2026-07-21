"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, isAdmin } from "@/lib/admin/auth";

// Basic IPv4 / IPv6 sanity check (also allows CIDR suffixes).
function isValidIp(ip: string): boolean {
  const value = ip.trim();
  if (!value) return false;
  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/\d{1,2})?$/;
  const ipv6 = /^[0-9a-fA-F:]+(\/\d{1,3})?$/;
  return ipv4.test(value) || (value.includes(":") && ipv6.test(value));
}

// Add an IP to the block list. Admin-only.
export async function blockIp(input: {
  ip: string;
  reason: string;
}): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage blocked IPs." };
  }

  const ip = input.ip.trim();
  if (!isValidIp(ip)) {
    return { error: "Please enter a valid IP address." };
  }
  const reason = input.reason.trim() || null;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blocked_ips").insert({ ip, reason });

  if (error) {
    if (error.code === "23505") {
      return { error: "That IP is already blocked." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/security");
  return {};
}

// Remove an IP from the block list. Admin-only.
export async function unblockIp(id: string): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to manage blocked IPs." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/security");
  return {};
}
