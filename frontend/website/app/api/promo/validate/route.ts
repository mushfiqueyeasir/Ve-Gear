import { NextRequest, NextResponse } from "next/server";
import { computePromoDiscount } from "@/lib/promoCodes";
import { resolveActivePromoCode } from "@/lib/promoCodes.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      code?: unknown;
      subtotal?: unknown;
    };
    const code = typeof body.code === "string" ? body.code : "";
    const subtotal = Number(body.subtotal) || 0;

    const resolved = await resolveActivePromoCode(code);
    if (resolved.error || !resolved.promo) {
      return NextResponse.json(
        { error: resolved.error || "Invalid promo code." },
        { status: 400 },
      );
    }

    const discount = computePromoDiscount(subtotal, resolved.promo.percent);
    return NextResponse.json({
      success: true,
      code: resolved.promo.code,
      percent: resolved.promo.percent,
      discount,
      endsAt: resolved.promo.ends_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not validate promo code." },
      { status: 500 },
    );
  }
}
