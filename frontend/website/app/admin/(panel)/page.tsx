import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/dashboard";
import { getSiteSettings } from "@/utility/getSettings";
import { StatCard } from "@/components/admin/StatCard";
import {
  WeeklyOrdersChart,
  WeeklySalesChart,
} from "@/components/admin/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import {
  formatMoney,
  formatDate,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const [data, settings] = await Promise.all([
    getDashboardData(),
    getSiteSettings(),
  ]);
  const symbol = settings.currency_symbol || "$";
  const firstName = session.fullName?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders today"
          value={data.ordersToday}
          icon="ShoppingCart"
          hint={`${data.ordersWeek} in the last 7 days`}
          accent="primary"
        />
        <StatCard
          label="Sales (7 days)"
          value={formatMoney(data.salesWeek, symbol)}
          icon="DollarSign"
          hint={`${formatMoney(data.salesTotal, symbol)} all-time`}
          accent="green"
        />
        <StatCard
          label="New customers"
          value={data.newCustomersWeek}
          icon="UserPlus"
          hint="Last 7 days"
          accent="blue"
        />
        <StatCard
          label="Low stock"
          value={data.lowStockCount}
          icon="AlertTriangle"
          hint={`${data.pendingCount} orders pending`}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Orders this week
          </h2>
          <WeeklyOrdersChart data={data.weekly} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Sales this week
          </h2>
          <WeeklySalesChart data={data.weekly} symbol={symbol} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {o.order_number}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[o.delivery?.firstName, o.delivery?.lastName]
                      .filter(Boolean)
                      .join(" ") || "Guest"}{" "}
                    · {formatDate(o.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", ORDER_STATUS_STYLES[o.status])}
                  >
                    {o.status}
                  </Badge>
                  <span className="font-medium text-foreground">
                    {formatMoney(o.totals?.total ?? 0, symbol)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
