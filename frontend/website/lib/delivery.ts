export type DeliveryZone = "inside-dhaka" | "outside-dhaka";

export interface DeliveryCharges {
  /** Cash-on-delivery charge for Dhaka city orders (store currency units). */
  insideDhaka: number;
  /** Cash-on-delivery charge for orders outside Dhaka. */
  outsideDhaka: number;
}

export const DEFAULT_DELIVERY_CHARGES: DeliveryCharges = {
  insideDhaka: 70,
  outsideDhaka: 120,
};

export function normalizeDeliveryCharges(raw: unknown): DeliveryCharges {
  const base = { ...DEFAULT_DELIVERY_CHARGES };
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const inside = Number(o.insideDhaka);
  const outside = Number(o.outsideDhaka);

  return {
    insideDhaka:
      Number.isFinite(inside) && inside >= 0
        ? Math.round(inside)
        : base.insideDhaka,
    outsideDhaka:
      Number.isFinite(outside) && outside >= 0
        ? Math.round(outside)
        : base.outsideDhaka,
  };
}

export function shippingCostForZone(
  charges: DeliveryCharges,
  zone: DeliveryZone,
): number {
  return zone === "outside-dhaka" ? charges.outsideDhaka : charges.insideDhaka;
}

export function deliveryZoneLabel(zone: DeliveryZone): string {
  return zone === "outside-dhaka" ? "Outside Dhaka" : "Inside Dhaka";
}
