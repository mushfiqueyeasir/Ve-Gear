import type { TrackOrderResult } from "@/type/orderType";

export async function trackOrder(
  orderNumber: string,
): Promise<TrackOrderResult> {
  const response = await fetch("/api/order/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderNumber }),
  });

  const data = (await response.json()) as TrackOrderResult & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Order not found");
  }

  return data;
}
