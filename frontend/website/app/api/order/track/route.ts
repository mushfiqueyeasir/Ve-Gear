import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deliveryZoneLabel } from "@/lib/delivery";
import type {
  OrderDelivery,
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from "@/type/db";

export const dynamic = "force-dynamic";

function normalizeOrderNumber(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderNumber?: unknown };
    const orderNumber = normalizeOrderNumber(body.orderNumber);

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Please enter an order number." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, delivery, totals, payment_method, created_at",
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json(
        { error: "Failed to look up order. Please try again." },
        { status: 500 },
      );
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const o = order as Pick<
      OrderRow,
      | "id"
      | "order_number"
      | "status"
      | "delivery"
      | "totals"
      | "payment_method"
      | "created_at"
    >;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("title, size, color, quantity, unit_price")
      .eq("order_id", o.id)
      .order("title", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to look up order. Please try again." },
        { status: 500 },
      );
    }

    const delivery = (o.delivery ?? {}) as OrderDelivery;
    const name =
      [delivery.firstName, delivery.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "Customer";
    const zone = delivery.shippingMethod ?? "inside-dhaka";

    return NextResponse.json({
      orderNumber: o.order_number,
      status: o.status as OrderStatus,
      createdAt: o.created_at,
      paymentMethod: o.payment_method || "cod",
      items: (
        (items as Pick<
          OrderItemRow,
          "title" | "size" | "color" | "quantity" | "unit_price"
        >[]) ?? []
      ).map((item) => ({
        title: item.title ?? "Item",
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price) || 0,
      })),
      totals: {
        subtotal: Number(o.totals?.subtotal) || 0,
        shipping: Number(o.totals?.shipping) || 0,
        total: Number(o.totals?.total) || 0,
      },
      delivery: {
        name,
        city: delivery.city?.trim() || null,
        zone: deliveryZoneLabel(zone),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up order. Please try again." },
      { status: 500 },
    );
  }
}
