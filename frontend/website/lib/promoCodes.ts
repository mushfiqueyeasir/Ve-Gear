export type PromoCodeRecord = {
  id: string;
  code: string;
  percent: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Flat % off subtotal only (delivery never discounted). */
export function computePromoDiscount(
  subtotal: number,
  percent: number,
): number {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safePercent = Math.min(100, Math.max(0, Number(percent) || 0));
  if (safeSubtotal <= 0 || safePercent <= 0) return 0;
  return Math.round((safeSubtotal * safePercent) / 100);
}

export function isPromoWindowActive(
  startsAt: string,
  endsAt: string,
  now = new Date(),
): boolean {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const t = now.getTime();
  return (
    Number.isFinite(start) && Number.isFinite(end) && t >= start && t <= end
  );
}
