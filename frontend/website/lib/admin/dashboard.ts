import "server-only";
import { subDays, startOfDay, format, isSameDay } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRow, OrderStatus } from "@/type/db";

export interface DashboardData {
  ordersToday: number;
  ordersWeek: number;
  salesWeek: number;
  salesTotal: number;
  newCustomersWeek: number;
  lowStockCount: number;
  pendingCount: number;
  statusBreakdown: { status: OrderStatus; count: number }[];
  weekly: { day: string; orders: number; sales: number }[];
  recentOrders: Pick<
    OrderRow,
    "id" | "order_number" | "status" | "totals" | "delivery" | "created_at"
  >[];
}

const isPaid = (status: OrderStatus) => status !== "cancelled";

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const weekAgo = subDays(new Date(), 6);

  const [{ data: orders }, { data: customers }, { data: variants }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, status, totals, delivery, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("customers").select("id, created_at"),
      supabase
        .from("product_variants")
        .select("stock_quantity, low_stock_threshold"),
    ]);

  type DashOrder = DashboardData["recentOrders"][number];
  const allOrders = (orders ?? []) as DashOrder[];

  const now = new Date();
  const total = (o: DashOrder) => Number(o.totals?.total ?? 0);

  const ordersToday = allOrders.filter((o) =>
    isSameDay(new Date(o.created_at), now),
  ).length;

  const weekOrders = allOrders.filter(
    (o) => new Date(o.created_at) >= startOfDay(weekAgo),
  );

  const salesWeek = weekOrders
    .filter((o) => isPaid(o.status))
    .reduce((s, o) => s + total(o), 0);

  const salesTotal = allOrders
    .filter((o) => isPaid(o.status))
    .reduce((s, o) => s + total(o), 0);

  const newCustomersWeek = (customers ?? []).filter(
    (c) => new Date(c.created_at as string) >= startOfDay(weekAgo),
  ).length;

  const lowStockCount = (variants ?? []).filter(
    (v) =>
      (v.stock_quantity as number) <= (v.low_stock_threshold as number),
  ).length;

  const pendingCount = allOrders.filter((o) => o.status === "pending").length;

  const statusOrder: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const statusBreakdown = statusOrder.map((status) => ({
    status,
    count: allOrders.filter((o) => o.status === status).length,
  }));

  // 7-day buckets
  const weekly = Array.from({ length: 7 }).map((_, i) => {
    const day = subDays(now, 6 - i);
    const dayOrders = allOrders.filter((o) =>
      isSameDay(new Date(o.created_at), day),
    );
    return {
      day: format(day, "EEE"),
      orders: dayOrders.length,
      sales: dayOrders
        .filter((o) => isPaid(o.status))
        .reduce((s, o) => s + total(o), 0),
    };
  });

  return {
    ordersToday,
    ordersWeek: weekOrders.length,
    salesWeek,
    salesTotal,
    newCustomersWeek,
    lowStockCount,
    pendingCount,
    statusBreakdown,
    weekly,
    recentOrders: allOrders.slice(0, 8),
  };
}
