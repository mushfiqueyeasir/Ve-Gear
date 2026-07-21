"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminList } from "@/components/admin/AdminList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatMoney,
  formatDate,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/type/db";

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
}: {
  data: OrderTableRow[];
  symbol: string;
}) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const rows = useMemo(
    () =>
      statusFilter === "all"
        ? data
        : data.filter((r) => r.status === statusFilter),
    [data, statusFilter],
  );

  return (
    <AdminList
      items={rows}
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
