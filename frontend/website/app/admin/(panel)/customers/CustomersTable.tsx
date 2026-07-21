"use client";

import Link from "next/link";
import { AdminList } from "@/components/admin/AdminList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/admin/format";
import type { CustomerRow } from "@/type/db";

export function CustomersTable({
  data,
  symbol,
}: {
  data: CustomerRow[];
  symbol: string;
}) {
  return (
    <AdminList
      items={data}
      searchPlaceholder="Search by name…"
      searchFilter={(item, q) =>
        (item.name ?? "").toLowerCase().includes(q) ||
        (item.phone ?? "").toLowerCase().includes(q) ||
        (item.email ?? "").toLowerCase().includes(q)
      }
      emptyMessage="No customers found."
      renderTitle={(item) => item.name || "—"}
      renderSubtitle={(item) =>
        [item.phone, item.email].filter(Boolean).join(" · ") || "—"
      }
      renderMeta={(item) => (
        <>
          <Badge variant="outline">
            {item.orders_count} order{item.orders_count === 1 ? "" : "s"}
          </Badge>
          <Badge variant="secondary">
            {formatMoney(item.total_spent, symbol)}
          </Badge>
        </>
      )}
      renderTrailing={(item) => (
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={`/admin/customers/${item.id}`}>View</Link>
        </Button>
      )}
    />
  );
}
