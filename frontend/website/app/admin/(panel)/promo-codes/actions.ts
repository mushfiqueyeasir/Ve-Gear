"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/auditLog";
import { normalizePromoCode } from "@/lib/promoCodes";

export interface PromoCodeInput {
  id?: string;
  code: string;
  percent: number;
  /** ISO date (YYYY-MM-DD) — end of day local treated as UTC end. */
  endsOn: string;
  active: boolean;
}

function endOfDayIso(dateYmd: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateYmd.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  if (Number.isNaN(end.getTime())) return null;
  return end.toISOString();
}

export async function savePromoCode(
  input: PromoCodeInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const code = normalizePromoCode(input.code);
  if (!code) return { error: "Promo code is required." };
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    return {
      error: "Use 3–32 characters: letters, numbers, underscore, or hyphen.",
    };
  }

  const percent = Number(input.percent);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    return { error: "Percent must be between 1 and 100." };
  }

  const endsAt = endOfDayIso(input.endsOn);
  if (!endsAt) return { error: "End date is required." };

  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  if (input.id) {
    const { data: existing } = await supabase
      .from("promo_codes")
      .select("starts_at")
      .eq("id", input.id)
      .maybeSingle();

    const startsAt = (existing?.starts_at as string | undefined) ?? nowIso;
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      return { error: "End date must be after the start date." };
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(endsAt).getTime() < startOfToday.getTime()) {
      return { error: "End date cannot be in the past." };
    }

    const { data, error } = await supabase
      .from("promo_codes")
      .update({
        code,
        percent,
        ends_at: endsAt,
        active: input.active,
        updated_at: nowIso,
      })
      .eq("id", input.id)
      .select("id")
      .single();

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        return { error: "That promo code already exists." };
      }
      return { error: error.message };
    }

    await writeAuditLog({
      actor: s,
      action: "update",
      entity: "promo_code",
      entityId: data.id as string,
      summary: `Updated promo code ${code} (${percent}% off)`,
      metadata: { percent, ends_at: endsAt, active: input.active },
    });

    revalidatePath("/admin/promo-codes");
    return { id: data.id as string };
  }

  const endDay = new Date(endsAt);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (endDay.getTime() < startOfToday.getTime()) {
    return { error: "End date cannot be in the past." };
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code,
      percent,
      starts_at: nowIso,
      ends_at: endsAt,
      active: input.active,
      updated_at: nowIso,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { error: "That promo code already exists." };
    }
    return { error: error.message };
  }

  await writeAuditLog({
    actor: s,
    action: "create",
    entity: "promo_code",
    entityId: data.id as string,
    summary: `Created promo code ${code} (${percent}% off)`,
    metadata: { percent, ends_at: endsAt, active: input.active },
  });

  revalidatePath("/admin/promo-codes");
  return { id: data.id as string };
}

export async function deletePromoCode(
  id: string,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("promo_codes")
    .select("code")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog({
    actor: s,
    action: "delete",
    entity: "promo_code",
    entityId: id,
    summary: row?.code
      ? `Deleted promo code ${String(row.code).toUpperCase()}`
      : `Deleted promo code ${id}`,
  });

  revalidatePath("/admin/promo-codes");
}

export async function togglePromoCode(
  id: string,
  active: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("promo_codes")
    .select("code")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("promo_codes")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog({
    actor: s,
    action: "toggle",
    entity: "promo_code",
    entityId: id,
    summary: `${active ? "Activated" : "Deactivated"} promo code ${
      row?.code ? String(row.code).toUpperCase() : id
    }`,
  });

  revalidatePath("/admin/promo-codes");
}
