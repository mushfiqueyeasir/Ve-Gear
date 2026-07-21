"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminList } from "@/components/admin/AdminList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateVariantStock } from "./actions";

export interface InventoryRow {
  id: string;
  productTitle: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

function StockEditor({
  row,
  canWrite,
}: {
  row: InventoryRow;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(row.stock_quantity));
  const [pending, startTransition] = useTransition();

  const dirty = Number(value) !== row.stock_quantity;

  const save = () => {
    startTransition(async () => {
      const res = await updateVariantStock(row.id, Number(value));
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Stock updated");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!canWrite || pending}
        className="h-9 w-20 rounded-full"
      />
      {canWrite ? (
        <Button
          size="icon"
          variant="outline"
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-full"
          aria-label="Save stock"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
}

export function InventoryTable({
  data,
  canWrite,
}: {
  data: InventoryRow[];
  canWrite: boolean;
}) {
  const [lowOnly, setLowOnly] = useState(false);

  const filtered = useMemo(
    () =>
      lowOnly
        ? data.filter((r) => r.stock_quantity <= r.low_stock_threshold)
        : data,
    [data, lowOnly],
  );

  return (
    <AdminList
      items={filtered}
      searchPlaceholder="Search products…"
      searchFilter={(item, q) =>
        item.productTitle.toLowerCase().includes(q) ||
        (item.sku ?? "").toLowerCase().includes(q) ||
        (item.size ?? "").toLowerCase().includes(q) ||
        (item.color ?? "").toLowerCase().includes(q)
      }
      emptyMessage="No variants found."
      toolbar={
        <Button
          variant={lowOnly ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setLowOnly((v) => !v)}
        >
          {lowOnly ? "Showing low stock" : "Low stock only"}
        </Button>
      }
      renderTitle={(item) => item.productTitle}
      renderSubtitle={(item) =>
        [
          item.size ? `Size ${item.size}` : null,
          item.color,
          item.sku ? `SKU ${item.sku}` : null,
          `Low at ${item.low_stock_threshold}`,
        ]
          .filter(Boolean)
          .join(" · ")
      }
      renderMeta={(item) => {
        const out = item.stock_quantity <= 0;
        const low = item.stock_quantity <= item.low_stock_threshold;
        if (out) return <Badge variant="destructive">Out of stock</Badge>;
        if (low) return <Badge variant="warning">Low stock</Badge>;
        return <Badge variant="success">In stock</Badge>;
      }}
      renderTrailing={(item) => (
        <StockEditor row={item} canWrite={canWrite} />
      )}
    />
  );
}
