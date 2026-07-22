"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/components/admin/AdminContext";
import { ORDER_TRANSITIONS } from "@/lib/admin/format";
import type { OrderStatus } from "@/type/db";
import { updateOrderStatus } from "../actions";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const { canWrite } = useAdmin();
  const [pending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const next = ORDER_TRANSITIONS[status] ?? [];

  const change = (to: OrderStatus) => {
    setPendingStatus(to);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, to);
      if (res.error) {
        toast.error(res.error);
        setPendingStatus(null);
        return;
      }
      toast.success(`Order marked ${to}`);
      setPendingStatus(null);
    });
  };

  if (!canWrite) {
    return (
      <p className="text-sm text-muted-foreground">
        You have read-only access.
      </p>
    );
  }

  if (next.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This order is {status}. No further transitions available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((to) => {
        const isLoading = pending && pendingStatus === to;
        return (
          <Button
            key={to}
            size="sm"
            variant={to === "cancelled" ? "destructive" : "default"}
            className="rounded-full capitalize"
            disabled={pending}
            onClick={() => change(to)}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Mark {to}
          </Button>
        );
      })}
    </div>
  );
}
