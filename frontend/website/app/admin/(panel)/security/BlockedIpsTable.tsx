"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  FormField,
  adminInputClass,
} from "@/components/admin/FormField";
import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/admin/format";
import type { BlockedIpRow } from "@/type/db";
import { blockIp, unblockIp } from "./actions";

export function BlockedIpsTable({ data }: { data: BlockedIpRow[] }) {
  const [, setTick] = useState(0);
  const [pending, startTransition] = useTransition();
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  const onAdd = () => {
    if (!ip.trim()) {
      toast.error("Enter an IP address.");
      return;
    }
    startTransition(async () => {
      const res = await blockIp({ ip, reason });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("IP blocked");
      setIp("");
      setReason("");
    });
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="Block an IP address"
        description="Prevent storefront access from a specific address."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <FormField label="IP address" htmlFor="ip" className="flex-1">
            <Input
              id="ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="203.0.113.42"
              className={`${adminInputClass} font-mono`}
            />
          </FormField>
          <FormField label="Reason (optional)" htmlFor="reason" className="flex-1">
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Fraudulent orders"
              className={adminInputClass}
            />
          </FormField>
          <Button
            onClick={onAdd}
            disabled={pending}
            className="rounded-full px-6"
          >
            {pending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Ban className="mr-2 size-4" />
            )}
            Block IP
          </Button>
        </div>
      </AdminCard>

      <AdminList
        items={data}
        searchPlaceholder="Search by IP…"
        searchFilter={(item, q) =>
          item.ip.toLowerCase().includes(q) ||
          (item.reason ?? "").toLowerCase().includes(q)
        }
        emptyMessage="No blocked IPs."
        renderTitle={(item) => (
          <span className="font-mono text-sm">{item.ip}</span>
        )}
        renderSubtitle={(item) =>
          `${item.reason || "No reason"} · ${formatDateTime(item.created_at)}`
        }
        renderTrailing={(item) => (
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-destructive"
                aria-label="Unblock IP"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title="Unblock IP"
            description={`Remove ${item.ip} from the block list?`}
            confirmLabel="Unblock"
            action={() => unblockIp(item.id)}
            onDone={() => setTick((t) => t + 1)}
          />
        )}
      />
    </div>
  );
}
