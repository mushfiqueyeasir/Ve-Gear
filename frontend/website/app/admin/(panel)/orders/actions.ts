"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { ORDER_TRANSITIONS } from "@/lib/admin/format";
import {
  RESTOCK_ON_DELETE_STATUSES,
  restockVariantsForOrders,
} from "@/lib/admin/orderStock";
import { getSiteSettings } from "@/utility/getSettings";
import { paymentMethodLabel } from "@/lib/payments/paymentLabels";
import type { InvoiceData } from "@/lib/admin/invoicePdf";
import type { OrderItemRow, OrderRow, OrderStatus } from "@/type/db";

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
    .select("status, order_number")
    .eq("id", orderId)
    .single();

  if (readError || !current) {
    return { error: readError?.message ?? "Order not found." };
  }

  const from = current.status as OrderStatus;

  // Delivered orders are final — never cancel / reverse.
  if (from === "delivered") {
    return { error: "Delivered orders cannot be cancelled or changed." };
  }

  const allowed = ORDER_TRANSITIONS[from] ?? [];
  if (!allowed.includes(status)) {
    return {
      error: `Cannot change status from "${from}" to "${status}".`,
    };
  }

  // Restock before marking cancelled so a failed restock doesn't leave
  // a cancelled order without inventory returned.
  if (status === "cancelled" && from !== "cancelled") {
    const restock = await restockVariantsForOrders(supabase, [orderId]);
    if (restock.error) return { error: restock.error };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  const orderNumber = current.order_number as string;
  await writeAuditLog({
    actor: s,
    action: "status_change",
    entity: "order",
    entityId: orderId,
    summary: `Changed order ${orderNumber} status from ${from} to ${status}`,
    metadata: {
      from,
      to: status,
      restocked: status === "cancelled",
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
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
  const { data: orderRow } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  const { error } = await supabase
    .from("orders")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  const orderLabel = orderRow?.order_number ?? orderId;
  await writeAuditLog({
    actor: s,
    action: "update",
    entity: "order",
    entityId: orderId,
    summary: `Updated notes for order ${orderLabel}`,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

function toInvoiceData(
  o: OrderRow,
  orderItems: OrderItemRow[],
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
): InvoiceData {
  const customerName =
    [o.delivery?.firstName, o.delivery?.lastName].filter(Boolean).join(" ") ||
    "Guest";
  const addressParts = [
    o.delivery?.address,
    o.delivery?.city,
    o.delivery?.postalCode,
    o.delivery?.country,
  ].filter(Boolean);

  return {
    orderNumber: o.order_number,
    createdAt: o.created_at,
    status: o.status,
    paymentMethod: paymentMethodLabel(o.payment_method),
    storeName: settings.store_name,
    storeEmail: settings.contact_email,
    storePhone: settings.contact_phone,
    currencyCode: settings.currency || "BDT",
    logoUrl: settings.logoUrl,
    palette: settings.palette,
    customerName,
    phone: o.delivery?.phone ?? null,
    addressLines: addressParts.map(String),
    deliveryZone: o.delivery?.shippingMethod
      ? o.delivery.shippingMethod === "outside-dhaka"
        ? "Outside Dhaka"
        : "Inside Dhaka"
      : null,
    items: orderItems.map((it) => ({
      title: it.title ?? "Item",
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      unitPrice: Number(it.unit_price) || 0,
    })),
    subtotal: Number(o.totals?.subtotal) || 0,
    shipping: Number(o.totals?.shipping) || 0,
    discount: Number(o.totals?.discount) || 0,
    discountPercent: Number(o.totals?.discount_percent) || undefined,
    promoCode: o.totals?.promo_code ?? null,
    total: Number(o.totals?.total) || 0,
  };
}

/** Load invoice payloads for bulk PDF download. */
export async function getOrdersInvoiceData(
  orderIds: string[],
): Promise<{ data?: InvoiceData[]; error?: string }> {
  await requireAdminSession();
  const ids = [...new Set(orderIds.filter(Boolean))];
  if (!ids.length) return { error: "No orders selected." };
  if (ids.length > 50) return { error: "Select at most 50 orders at a time." };

  const supabase = await createSupabaseServerClient();
  const [{ data: orders, error }, settings] = await Promise.all([
    supabase.from("orders").select("*").in("id", ids),
    getSiteSettings(),
  ]);
  if (error) return { error: error.message };

  const list = (orders as OrderRow[] | null) ?? [];
  if (!list.length) return { error: "No orders found." };

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      list.map((o) => o.id),
    );
  if (itemsError) return { error: itemsError.message };

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const it of (items as OrderItemRow[] | null) ?? []) {
    const bucket = byOrder.get(it.order_id) ?? [];
    bucket.push(it);
    byOrder.set(it.order_id, bucket);
  }

  const orderById = new Map(list.map((o) => [o.id, o]));
  const data = ids
    .map((id) => orderById.get(id))
    .filter((o): o is OrderRow => Boolean(o))
    .map((o) => toInvoiceData(o, byOrder.get(o.id) ?? [], settings));

  return { data };
}

/** Permanently delete one or more orders (items cascade). */
export async function deleteOrders(
  orderIds: string[],
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const ids = [...new Set(orderIds.filter(Boolean))];
  if (!ids.length) return { error: "No orders selected." };
  if (ids.length > 50) return { error: "Select at most 50 orders at a time." };

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: readError } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .in("id", ids);
  if (readError) return { error: readError.message };

  const rows = (existing ?? []) as {
    id: string;
    order_number: string;
    status: OrderStatus;
  }[];
  if (!rows.length) return { error: "No orders found." };

  // Only unshipped orders return stock. Cancelled already restocked on cancel;
  // shipped/delivered keep stock out (goods left / delivered).
  const restockIds = rows
    .filter((r) => RESTOCK_ON_DELETE_STATUSES.includes(r.status as OrderStatus))
    .map((r) => r.id);

  if (restockIds.length) {
    const restock = await restockVariantsForOrders(supabase, restockIds);
    if (restock.error) return { error: restock.error };
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .in(
      "id",
      rows.map((r) => r.id),
    );
  if (error) return { error: error.message };

  const numbers = rows.map((r) => r.order_number).join(", ");
  await writeAuditLog({
    actor: s,
    action: "delete",
    entity: "order",
    entityId: rows.length === 1 ? rows[0].id : null,
    summary:
      rows.length === 1
        ? `Deleted order ${rows[0].order_number}`
        : `Deleted ${rows.length} orders (${numbers})`,
    metadata: {
      ids: rows.map((r) => r.id),
      count: rows.length,
      restockedIds: restockIds,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
}
