import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/utility/getSettings";
import { shippingCostForZone, type DeliveryZone } from "@/lib/delivery";
import type { OrderFormData } from "@/type/orderType";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function resolveZone(value: string | undefined): DeliveryZone {
  return value === "outside-dhaka" ? "outside-dhaka" : "inside-dhaka";
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderFormData = await request.json();

    if (!body.delivery || !body.items || !body.totals) {
      return NextResponse.json(
        { error: "Delivery, items, and totals are required" },
        { status: 400 },
      );
    }

    const { firstName, lastName, address, city, phone } = body.delivery;
    if (!firstName || !lastName || !address || !city || !phone) {
      return NextResponse.json(
        { error: "Please complete all delivery information" },
        { status: 400 },
      );
    }

    if (body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 },
      );
    }

    const settings = await getSiteSettings();
    const zone = resolveZone(body.delivery.shippingMethod);
    const shipping = shippingCostForZone(settings.deliveryCharges, zone);
    const subtotal = Number(body.totals.subtotal) || 0;
    const total = subtotal + shipping;

    const payload = {
      delivery: {
        country: body.delivery.country?.trim() ?? "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: body.delivery.postalCode?.trim() ?? "",
        phone: phone.trim(),
        shippingMethod: zone,
      },
      items: body.items.map((item) => ({
        product_id: item.product,
        variant_id: item.variantId ?? null,
        title: item.title ?? "",
        size: item.size,
        color: item.color ?? null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      totals: {
        subtotal,
        shipping,
        total,
      },
      notes: body.notes?.trim() ?? "",
    };

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("place_order", { payload });

    if (error) throw error;

    const result = data as { id: string; order_number: string };
    return NextResponse.json(
      {
        success: true,
        id: result.id,
        orderNumber: result.order_number,
        message: "Order placed successfully",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to place order. Please try again later." },
      { status: 500 },
    );
  }
}
