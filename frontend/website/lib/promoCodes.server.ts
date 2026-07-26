import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isPromoWindowActive,
  normalizePromoCode,
  type PromoCodeRecord,
} from "@/lib/promoCodes";

export async function resolveActivePromoCode(
  rawCode: string,
): Promise<{ promo?: PromoCodeRecord; error?: string }> {
  const code = normalizePromoCode(rawCode);
  if (!code) return { error: "Enter a promo code." };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, percent, starts_at, ends_at, active")
    .ilike("code", code)
    .maybeSingle();

  if (error) return { error: "Could not validate promo code." };
  if (!data || !data.active) return { error: "This promo code is not valid." };

  const promo: PromoCodeRecord = {
    id: data.id as string,
    code: String(data.code).toUpperCase(),
    percent: Number(data.percent),
    starts_at: data.starts_at as string,
    ends_at: data.ends_at as string,
    active: Boolean(data.active),
  };

  if (!isPromoWindowActive(promo.starts_at, promo.ends_at)) {
    return { error: "This promo code has expired or is not active yet." };
  }

  return { promo };
}
