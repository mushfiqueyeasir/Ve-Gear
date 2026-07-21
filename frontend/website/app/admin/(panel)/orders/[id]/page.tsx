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
  formatDateTime,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { OrderRow, OrderItemRow } from "@/type/db";
import { DownloadInvoiceButton } from "@/components/admin/DownloadInvoiceButton";
import { OrderNotes } from "./OrderNotes";
import { OrderStatusControl } from "./OrderStatusControl";

export const dynamic = "force-dynamic";

const card = "rounded-2xl border border-border bg-card/80 p-5 sm:p-6";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdminSession();
  const supabase = await createSupabaseServerClient();

  const [{ data: order }, settings] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    getSiteSettings(),
  ]);

  if (!order) notFound();
  const o = order as OrderRow;
  const symbol = settings.currency_symbol || "$";
  const currencyCode = settings.currency || "BDT";

  const [{ data: items }, customerRes] = await Promise.all([
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("title", { ascending: true }),
    o.customer_id
      ? supabase
          .from("customers")
          .select("id, name")
          .eq("id", o.customer_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const orderItems = (items as OrderItemRow[] | null) ?? [];
  const customer = customerRes.data as {
    id: string;
    name: string | null;
  } | null;

  const customerName =
    [o.delivery?.firstName, o.delivery?.lastName].filter(Boolean).join(" ") ||
    customer?.name ||
    "Guest";

  const addressParts = [
    o.delivery?.address,
    o.delivery?.city,
    o.delivery?.postalCode,
    o.delivery?.country,
  ].filter(Boolean);

  return (
    <div>
      <BackLink href="/admin/orders" label="Back to orders" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {o.order_number}
            </h1>
            <Badge
              variant="outline"
              className={cn("capitalize", ORDER_STATUS_STYLES[o.status])}
            >
              {o.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(o.created_at)} · Payment: {o.payment_method}
          </p>
        </div>
        <DownloadInvoiceButton
          invoice={{
            orderNumber: o.order_number,
            createdAt: o.created_at,
            status: o.status,
            paymentMethod: o.payment_method || "COD",
            storeName: settings.store_name,
            storeEmail: settings.contact_email,
            storePhone: settings.contact_phone,
            currencyCode,
            logoUrl: settings.logoUrl,
            palette: settings.palette,
            customerName,
            phone: o.delivery?.phone ?? null,
            addressLines: addressParts.map(String),
            deliveryZone: o.delivery?.shippingMethod
              ? o.delivery.shippingMethod === "outside-dhaka"
                ? "Outside Dhaka"
                : "Inside Dhaka"
              : null,
            items: orderItems.map((it) => ({
              title: it.title ?? "Item",
              size: it.size,
              color: it.color,
              quantity: it.quantity,
              unitPrice: Number(it.unit_price) || 0,
            })),
            subtotal: Number(o.totals?.subtotal) || 0,
            shipping: Number(o.totals?.shipping) || 0,
            total: Number(o.totals?.total) || 0,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className={card}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Items
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="min-w-[36rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-16 text-center text-muted-foreground"
                      >
                        No items on this order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderItems.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium text-foreground">
                          {it.title ?? "—"}
                        </TableCell>
                        <TableCell>{it.size ?? "—"}</TableCell>
                        <TableCell>{it.color ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {it.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMoney(it.unit_price, symbol)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatMoney(it.unit_price * it.quantity, symbol)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  {formatMoney(o.totals?.subtotal ?? 0, symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {formatMoney(o.totals?.shipping ?? 0, symbol)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  {formatMoney(o.totals?.total ?? 0, symbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={card}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Notes
            </h2>
            <OrderNotes orderId={o.id} initialNotes={o.notes} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Status workflow */}
          <div className={card}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Update status
            </h2>
            <OrderStatusControl orderId={o.id} status={o.status} />
          </div>

          {/* Delivery / shipping */}
          <div className={card}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Delivery details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Icon
                  name="Users"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="text-foreground">
                    {customer ? (
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-primary hover:underline"
                      >
                        {customerName}
                      </Link>
                    ) : (
                      customerName
                    )}
                  </dd>
                </div>
              </div>
              {o.delivery?.phone && (
                <div className="flex items-start gap-2">
                  <Icon
                    name="Phone"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="text-foreground">{o.delivery.phone}</dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Icon
                  name="MapPin"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-foreground">
                    {addressParts.length > 0 ? (
                      <span className="whitespace-pre-line">
                        {addressParts.join(", ")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </div>
              {o.delivery?.shippingMethod && (
                <div className="flex items-start gap-2">
                  <Icon
                    name="PackageOpen"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <dt className="text-muted-foreground">Delivery zone</dt>
                    <dd className="text-foreground">
                      {o.delivery.shippingMethod === "outside-dhaka"
                        ? "Outside Dhaka"
                        : "Inside Dhaka"}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
