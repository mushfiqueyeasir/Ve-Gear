import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/utility/getSettings";
import { productImageUrl } from "@/utility/imageUrl";
import {
  deliveryZoneLabel,
  shippingCostForZone,
  type DeliveryZone,
} from "@/lib/delivery";
import { sendOrderEmails } from "@/lib/email/sendOrderEmails";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { computePromoDiscount } from "@/lib/promoCodes";
import { resolveActivePromoCode } from "@/lib/promoCodes.server";
import type { OrderFormData } from "@/type/orderType";
import type { ProductImageRow } from "@/type/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function resolveZone(value: string | undefined): DeliveryZone {
  return value === "outside-dhaka" ? "outside-dhaka" : "inside-dhaka";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    const customerEmail = (body.delivery.email ?? "").trim();

    if (!firstName || !lastName || !address || !city || !phone) {
      return NextResponse.json(
        { error: "Please complete all delivery information" },
        { status: 400 },
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required for order confirmation" },
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

    let discount = 0;
    let discountPercent: number | undefined;
    let promoCode: string | null = null;
    const requestedCode =
      body.promoCode?.trim() || body.totals.promo_code?.trim() || "";

    if (requestedCode) {
      const resolved = await resolveActivePromoCode(requestedCode);
      if (resolved.error || !resolved.promo) {
        return NextResponse.json(
          { error: resolved.error || "Invalid promo code." },
          { status: 400 },
        );
      }
      promoCode = resolved.promo.code;
      discountPercent = resolved.promo.percent;
      discount = computePromoDiscount(subtotal, resolved.promo.percent);
    }

    const total = Math.max(0, subtotal - discount) + shipping;

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
        discount,
        discount_percent: discountPercent ?? null,
        promo_code: promoCode,
        total,
      },
      notes: body.notes?.trim() ?? "",
    };

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("place_order", { payload });

    if (error) throw error;

    const result = data as { id: string; order_number: string };
    const customerName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const deliveryAddress = [
      address.trim(),
      city.trim(),
      body.delivery.postalCode?.trim(),
      body.delivery.country?.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    // Fire-and-forget style: order already saved — email failures shouldn't fail checkout
    try {
      const productIds = [
        ...new Set(body.items.map((item) => item.product).filter(Boolean)),
      ];
      const imageByProduct = new Map<string, string>();
      if (productIds.length > 0) {
        const { data: imageRows } = await supabase
          .from("product_images")
          .select("product_id, path, is_main, sort")
          .in("product_id", productIds)
          .order("is_main", { ascending: false })
          .order("sort", { ascending: true });

        for (const row of (imageRows as ProductImageRow[] | null) ?? []) {
          if (imageByProduct.has(row.product_id)) continue;
          const url = productImageUrl(row.path);
          if (url) imageByProduct.set(row.product_id, url);
        }
      }

      await sendOrderEmails({
        orderNumber: result.order_number,
        customerName,
        customerEmail,
        customerPhone: phone.trim(),
        deliveryAddress,
        shippingLabel: `Cash on delivery · ${deliveryZoneLabel(zone)}`,
        items: body.items.map((item) => ({
          title: item.title ?? "Product",
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          imageUrl: imageByProduct.get(item.product) ?? null,
        })),
        subtotal,
        shipping,
        discount,
        discountPercent,
        promoCode,
        total,
        currencyLabel: settings.currency || "BDT",
        storeName: settings.store_name || "VE Gear",
        logoUrl: settings.logoUrl,
        palette: settings.palette,
      });
    } catch {
      // Ignore mail errors — order is already placed
    }

    await writeAuditLog({
      action: "create",
      entity: "order",
      entityId: result.id,
      summary: promoCode
        ? `New storefront order ${result.order_number} (promo ${promoCode})`
        : `New storefront order ${result.order_number}`,
      metadata: promoCode
        ? { promo_code: promoCode, discount, discount_percent: discountPercent }
        : undefined,
    });

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
