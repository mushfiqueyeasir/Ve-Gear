"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, BadgePercent } from "lucide-react";
import { toast } from "sonner";
import type { PromotionRow } from "@/type/db";
import { promotionImageUrl } from "@/utility/imageUrl";
import { formatDate } from "@/lib/admin/format";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { deletePromotion, togglePromotion } from "./actions";

function ActiveToggle({
  id,
  active,
  canWrite,
}: {
  id: string;
  active: boolean;
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <Badge variant={active ? "success" : "secondary"}>
        {active ? "Active" : "Inactive"}
      </Badge>
    );
  }

  return (
    <Switch
      checked={active}
      disabled={pending}
      onCheckedChange={(next) =>
        startTransition(async () => {
          const res = await togglePromotion(id, next);
          if (res?.error) toast.error(res.error);
          else toast.success(next ? "Activated" : "Deactivated");
        })
      }
      aria-label="Toggle active"
    />
  );
}

export function PromotionsTable({
  data,
  canWrite,
}: {
  data: PromotionRow[];
  canWrite: boolean;
}) {
  return (
    <AdminList
      items={data}
      searchPlaceholder="Search promotions…"
      searchFilter={(item, q) => item.title.toLowerCase().includes(q)}
      emptyMessage="No promotions yet. Create your first one."
      renderLeading={(item) => {
        const url = promotionImageUrl(item.image_path);
        return (
          <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted">
            {url ? (
              <Image
                src={url}
                alt={item.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <BadgePercent className="size-5" />
              </div>
            )}
          </div>
        );
      }}
      renderTitle={(item) => item.title}
      renderSubtitle={(item) =>
        `${item.starts_at ? formatDate(item.starts_at) : "—"} → ${
          item.ends_at ? formatDate(item.ends_at) : "—"
        }`
      }
      renderMeta={(item) =>
        item.discount_percent != null ? (
          <Badge variant="outline">{item.discount_percent}% off</Badge>
        ) : null
      }
      renderTrailing={(item) => (
        <>
          <ActiveToggle id={item.id} active={item.active} canWrite={canWrite} />
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href={`/admin/promotions/${item.id}`} aria-label="Edit">
              <Pencil className="size-4" />
            </Link>
          </Button>
          {canWrite ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              }
              title="Delete promotion?"
              description={`"${item.title}" will be permanently removed.`}
              confirmLabel="Delete"
              action={() => deletePromotion(item.id)}
            />
          ) : null}
        </>
      )}
    />
  );
}
