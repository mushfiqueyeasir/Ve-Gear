"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadOrderInvoicesZip } from "@/lib/admin/invoicePdf";
import {
  formatMoney,
  formatDate,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/type/db";
import { deleteOrders, getOrdersInvoiceData } from "./actions";

export interface OrderTableRow {
  id: string;
  order_number: string;
  customer: string;
  created_at: string;
  status: OrderStatus;
  total: number;
}

export function OrdersTable({
  data,
  symbol,
  canWrite,
}: {
  data: OrderTableRow[];
  symbol: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [downloading, startDownload] = useTransition();

  const rows = useMemo(
    () =>
      statusFilter === "all"
        ? data
        : data.filter((r) => r.status === statusFilter),
    [data, statusFilter],
  );

  const downloadSelected = () => {
    if (!selectedIds.length) return;
    startDownload(async () => {
      const res = await getOrdersInvoiceData(selectedIds);
      if (res.error || !res.data?.length) {
        toast.error(res.error ?? "Could not load invoices.");
        return;
      }
      try {
        await downloadOrderInvoicesZip(res.data);
        toast.success(
          res.data.length === 1
            ? "Invoice downloaded"
            : `${res.data.length} invoices downloaded as ZIP`,
        );
      } catch {
        toast.error("Could not generate invoice download.");
      }
    });
  };

  return (
    <AdminList
      items={rows}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      searchPlaceholder="Search by order number…"
      searchFilter={(item, q) =>
        item.order_number.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q)
      }
      emptyMessage="No orders found."
      toolbar={
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
        >
          <SelectTrigger className="w-full rounded-full sm:w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((st) => (
              <SelectItem key={st} value={st} className="capitalize">
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      selectionActions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full"
            disabled={downloading || selectedIds.length === 0}
            onClick={downloadSelected}
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download
          </Button>
          {canWrite ? (
            <ConfirmDialog
              title={
                selectedIds.length === 1
                  ? "Delete this order?"
                  : `Delete ${selectedIds.length} orders?`
              }
              description="This permanently removes the selected orders and their line items. Stock is returned only for orders that are not yet shipped (pending, confirmed, or processing). This cannot be undone."
              confirmLabel="Delete"
              action={async () => {
                const res = await deleteOrders(selectedIds);
                if (res && "error" in res && res.error) return res;
                setSelectedIds([]);
                router.refresh();
              }}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={selectedIds.length === 0}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              }
            />
          ) : null}
        </>
      }
      renderTitle={(item) => item.order_number}
      renderSubtitle={(item) =>
        `${item.customer} · ${formatDate(item.created_at)}`
      }
      renderMeta={(item) => (
        <>
          <Badge
            variant="outline"
            className={cn("capitalize", ORDER_STATUS_STYLES[item.status])}
          >
            {item.status}
          </Badge>
          <Badge variant="secondary">{formatMoney(item.total, symbol)}</Badge>
        </>
      )}
      renderTrailing={(item) => (
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={`/admin/orders/${item.id}`}>View</Link>
        </Button>
      )}
    />
  );
}
