"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatNumber } from "@/lib/admin/format";
import { deleteProduct, reorderProducts } from "./actions";

export interface ProductTableRow {
  id: string;
  title: string;
  slug: string;
  status: "active" | "draft" | "archived";
  current_price: number;
  mainImage: string | null;
  totalStock: number;
  categories: string[];
  sort: number;
}

const STATUS_VARIANT: Record<
  ProductTableRow["status"],
  "success" | "warning" | "secondary"
> = {
  active: "success",
  draft: "warning",
  archived: "secondary",
};

export function ProductsTable({
  data,
  symbol,
  canWrite,
}: {
  data: ProductTableRow[];
  symbol: string;
  canWrite: boolean;
}) {
  const router = useRouter();

  return (
    <AdminList
      items={data}
      sortable
      canReorder={canWrite}
      onReorder={reorderProducts}
      hint="Drag the handle to reorder products on the storefront."
      searchPlaceholder="Search products…"
      searchFilter={(item, q) =>
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.categories.some((c) => c.toLowerCase().includes(q))
      }
      emptyMessage="No products yet."
      renderLeading={(item) => (
        <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted">
          {item.mainImage ? (
            <Image
              src={item.mainImage}
              alt={item.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-4" />
            </div>
          )}
        </div>
      )}
      renderTitle={(item) => item.title}
      renderSubtitle={(item) => item.slug}
      renderMeta={(item) => (
        <>
          <Badge variant={STATUS_VARIANT[item.status]} className="capitalize">
            {item.status}
          </Badge>
          <Badge variant="outline">
            {formatMoney(item.current_price, symbol)}
          </Badge>
          <Badge variant="outline">Stock {formatNumber(item.totalStock)}</Badge>
          {item.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
        </>
      )}
      renderTrailing={(item) => (
        <>
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href={`/admin/products/${item.id}`} aria-label="Edit">
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
              title="Delete product"
              description={`Delete "${item.title}"? Images and variants will also be removed.`}
              confirmLabel="Delete"
              action={() => deleteProduct(item.id)}
              onDone={() => router.refresh()}
            />
          ) : null}
        </>
      )}
    />
  );
}
