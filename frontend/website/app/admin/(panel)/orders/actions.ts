"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { ORDER_TRANSITIONS } from "@/lib/admin/format";
import type { OrderStatus } from "@/type/db";

// Update an order's status, enforcing the allowed workflow transitions.
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (readError || !current) {
    return { error: readError?.message ?? "Order not found." };
  }

  const from = current.status as OrderStatus;
  const allowed = ORDER_TRANSITIONS[from] ?? [];
  if (!allowed.includes(status)) {
    return {
      error: `Cannot change status from "${from}" to "${status}".`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

// Save free-form internal notes on an order.
export async function saveOrderNotes(
  orderId: string,
  notes: string,
): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}
