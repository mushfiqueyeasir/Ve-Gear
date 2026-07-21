"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import ImageLoader from "@/components/Common/ImageLoader";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

export default function WishlistPageScreen() {
  const { items, removeItem, clear } = useWishlistStore();
  const { format } = useCurrency();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="py-20 text-center">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full border border-border bg-card">
            <Heart className="size-6 text-muted-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold">No favorites yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any product to save it here. Favorites stay on this
            device.
          </p>
          <Link
            href="/product"
            className="mt-7 inline-block rounded-full bg-foreground px-7 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 lg:mb-10">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Favorites
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success("Favorites cleared");
            }}
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Clear all
          </button>
          <Link
            href="/product"
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Link href={item.href} className="relative block aspect-[4/5]">
              <ImageLoader
                src={item.image}
                alt={item.title}
                width={800}
                height={1000}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={item.href}
                    className="font-display text-lg font-semibold tracking-tight hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-base font-semibold">
                      {format(item.currentPrice)}
                    </span>
                    {item.originalPrice > item.currentPrice && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground line-through">
                        {format(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={() => {
                    removeItem(item.id);
                    toast.success("Removed from favorites");
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Link
                href={item.href}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-primary hover:text-primary-foreground"
              >
                <ShoppingBag className="size-3.5" />
                View product
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
