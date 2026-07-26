"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatDate, formatDateTime } from "@/lib/admin/format";
import type { PromoCodeRow } from "@/type/db";
import { deletePromoCode, togglePromoCode } from "./actions";
import { PromoCodeDialog } from "./PromoCodeDialog";

function statusLabel(row: PromoCodeRow): {
  label: string;
  variant: "success" | "warning" | "secondary" | "destructive";
} {
  const now = Date.now();
  const start = new Date(row.starts_at).getTime();
  const end = new Date(row.ends_at).getTime();
  if (!row.active) return { label: "Inactive", variant: "secondary" };
  if (now < start) return { label: "Scheduled", variant: "warning" };
  if (now > end) return { label: "Expired", variant: "destructive" };
  return { label: "Live", variant: "success" };
}

export function PromoCodesTable({
  data,
  canWrite,
}: {
  data: PromoCodeRow[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [, setTick] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <AdminList
      items={data}
      searchPlaceholder="Search promo codes…"
      searchFilter={(item, q) => item.code.toLowerCase().includes(q)}
      emptyMessage="No promo codes yet."
      renderTitle={(item) => item.code}
      renderSubtitle={(item) =>
        `${item.percent}% off · ${formatDate(item.starts_at)} → ${formatDate(item.ends_at)} · Updated ${formatDateTime(item.updated_at)}`
      }
      renderMeta={(item) => {
        const status = statusLabel(item);
        return (
          <Badge variant={status.variant} className="capitalize">
            {status.label}
          </Badge>
        );
      }}
      renderTrailing={(item) => (
        <>
          {canWrite ? (
            <Switch
              checked={item.active}
              disabled={pending && pendingId === item.id}
              onCheckedChange={(active) => {
                setPendingId(item.id);
                startTransition(async () => {
                  const res = await togglePromoCode(item.id, active);
                  setPendingId(null);
                  if (res?.error) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success(active ? "Code activated" : "Code deactivated");
                  router.refresh();
                });
              }}
              aria-label="Toggle active"
            />
          ) : null}
          {canWrite ? <PromoCodeDialog mode="edit" promo={item} /> : null}
          {canWrite ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive"
                  aria-label="Delete promo code"
                >
                  <Trash2 className="size-4" />
                </Button>
              }
              title="Delete promo code"
              description={`Permanently delete ${item.code}? Customers will no longer be able to use it.`}
              confirmLabel="Delete"
              action={() => deletePromoCode(item.id)}
              onDone={() => {
                setTick((t) => t + 1);
                router.refresh();
              }}
            />
          ) : null}
        </>
      )}
    />
  );
}
