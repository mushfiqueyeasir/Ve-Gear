"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/admin/format";
import type { CustomerRow } from "@/type/db";
import { deleteCustomers } from "./actions";

export function CustomersTable({
  data,
  symbol,
  canWrite,
}: {
  data: CustomerRow[];
  symbol: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <AdminList
      items={data}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      searchPlaceholder="Search by name…"
      searchFilter={(item, q) =>
        (item.name ?? "").toLowerCase().includes(q) ||
        (item.phone ?? "").toLowerCase().includes(q) ||
        (item.email ?? "").toLowerCase().includes(q)
      }
      emptyMessage="No customers found."
      selectionActions={
        canWrite ? (
          <ConfirmDialog
            title={
              selectedIds.length === 1
                ? "Delete this customer?"
                : `Delete ${selectedIds.length} customers?`
            }
            description="This permanently removes the selected customers and all of their order history. Stock is returned only for orders that are not yet shipped (pending, confirmed, or processing). This cannot be undone."
            confirmLabel="Delete"
            action={async () => {
              const res = await deleteCustomers(selectedIds);
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
        ) : null
      }
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
