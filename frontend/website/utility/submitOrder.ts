import type { OrderFormData, OrderFormResponse } from "@/type/orderType";

export async function submitOrder(
  orderData: OrderFormData,
): Promise<OrderFormResponse> {
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to place order");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to place order. Please try again.");
  }
}
