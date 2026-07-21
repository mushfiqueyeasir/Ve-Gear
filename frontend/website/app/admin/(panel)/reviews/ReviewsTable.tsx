"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import type { ReviewRow } from "@/type/db";
import { reviewImageUrl } from "@/utility/imageUrl";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { deleteReview, toggleReview } from "./actions";

export type ReviewWithProduct = ReviewRow & { productTitle: string | null };

function Stars({ rating }: { rating: number | null }) {
  const value = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5" title={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-3.5",
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function PublishToggle({
  id,
  isPublished,
  canWrite,
}: {
  id: string;
  isPublished: boolean;
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <Badge variant={isPublished ? "success" : "secondary"}>
        {isPublished ? "Published" : "Hidden"}
      </Badge>
    );
  }

  return (
    <Switch
      checked={isPublished}
      disabled={pending}
      onCheckedChange={(next) =>
        startTransition(async () => {
          const res = await toggleReview(id, next);
          if (res?.error) toast.error(res.error);
          else toast.success(next ? "Published" : "Hidden");
        })
      }
      aria-label="Toggle published"
    />
  );
}

export function ReviewsTable({
  data,
  canWrite,
}: {
  data: ReviewWithProduct[];
  canWrite: boolean;
}) {
  return (
    <AdminList
      items={data}
      searchPlaceholder="Search reviews…"
      searchFilter={(item, q) =>
        (item.customer_name ?? "").toLowerCase().includes(q) ||
        (item.body ?? "").toLowerCase().includes(q) ||
        (item.productTitle ?? "").toLowerCase().includes(q)
      }
      emptyMessage="No reviews yet."
      renderLeading={(item) => {
        const url = reviewImageUrl(item.image_path);
        return (
          <div className="relative size-12 overflow-hidden rounded-full border border-border bg-muted">
            {url ? (
              <Image
                src={url}
                alt={item.customer_name ?? "Reviewer"}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">
                {(item.customer_name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );
      }}
      renderTitle={(item) => item.customer_name ?? "—"}
      renderSubtitle={(item) =>
        item.body
          ? item.body.length > 90
            ? `${item.body.slice(0, 90)}…`
            : item.body
          : "—"
      }
      renderMeta={(item) => (
        <>
          <Stars rating={item.rating} />
          {item.productTitle ? (
            <Badge variant="outline">{item.productTitle}</Badge>
          ) : null}
        </>
      )}
      renderTrailing={(item) => (
        <>
          <PublishToggle
            id={item.id}
            isPublished={item.is_published}
            canWrite={canWrite}
          />
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href={`/admin/reviews/${item.id}`} aria-label="Edit">
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
              title="Delete review?"
              description={`The review by "${
                item.customer_name ?? "this customer"
              }" will be permanently removed.`}
              confirmLabel="Delete"
              action={() => deleteReview(item.id)}
            />
          ) : null}
        </>
      )}
    />
  );
}
