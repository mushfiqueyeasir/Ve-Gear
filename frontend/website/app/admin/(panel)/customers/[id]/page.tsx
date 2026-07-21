import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/utility/getSettings";
import { BackLink } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/admin/Icon";
import {
  formatMoney,
  formatDate,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { CustomerRow, OrderRow } from "@/type/db";

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-border bg-card/80 p-5 sm:p-6";

// Render an address jsonb object into readable lines, in a sensible order.
function readableAddress(address: Record<string, unknown> | null): string[] {
  if (!address) return [];
  const order = [
    "address",
    "line1",
    "line2",
    "city",
    "state",
    "postalCode",
    "zip",
    "country",
  ];
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const key of order) {
    const v = address[key];
    if (v != null && String(v).trim() !== "") {
      parts.push(String(v));
      seen.add(key);
    }
  }
  // Include any remaining primitive fields not covered above.
  for (const [key, v] of Object.entries(address)) {
    if (seen.has(key)) continue;
    if (v != null && typeof v !== "object" && String(v).trim() !== "") {
      parts.push(String(v));
    }
  }
  return parts;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();

  const [{ data: customer }, settings] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    getSiteSettings(),
  ]);

  if (!customer) notFound();
  const c = customer as CustomerRow;
  const symbol = settings.currency_symbol || "$";

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, totals, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const history = (orders as OrderRow[] | null) ?? [];
  const addressLines = readableAddress(c.address);

  return (
    <div>
      <BackLink href="/admin/customers" label="Back to customers" />

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {c.name || "Unnamed customer"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customer since {formatDate(c.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className={card}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Contact
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon
                  name="Phone"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="text-foreground">{c.phone || "—"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Icon
                  name="Mail"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="break-all text-foreground">
                    {c.email || "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Icon
                  name="MapPin"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-foreground">
                    {addressLines.length > 0 ? addressLines.join(", ") : "—"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className={card}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Totals
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders</span>
                <span className="font-medium text-foreground">
                  {c.orders_count}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-medium text-foreground">
                  {formatMoney(c.total_spent, symbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className={card}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Order history
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-16 text-center text-muted-foreground"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium text-foreground">
                          {o.order_number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(o.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              ORDER_STATUS_STYLES[o.status],
                            )}
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatMoney(o.totals?.total ?? 0, symbol)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
