"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import ProductModal from "./ProductModal";
import ImageLoader from "./ImageLoader";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import type { ProductStock } from "@/type/productType";

export interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  hoverImage?: string;
  images?: string[];
  originalPrice: number;
  currentPrice: number;
  discount?: number;
  href: string;
  stock?: ProductStock[];
  tag?: string;
}

export default function ProductCard({
  id,
  title,
  image,
  hoverImage,
  images,
  originalPrice,
  currentPrice,
  discount,
  href,
  stock,
  tag,
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { format } = useCurrency();
  const isFavorite = useWishlistStore((s) => s.isFavorite(id));
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  const isOutOfStock = (() => {
    if (!stock || stock.length === 0) return true;
    return stock.reduce((sum, item) => sum + (item.quantity || 0), 0) === 0;
  })();

  const badge =
    tag ||
    (isOutOfStock
      ? "Sold Out"
      : discount && discount > 0
        ? `${discount}% Off`
        : "New");

  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-white/20 hover:ring-glow">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Link href={href} className="block h-full w-full">
            <ImageLoader
              src={image}
              alt={title}
              width={800}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
            />
            {hoverImage && (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <ImageLoader
                  src={hoverImage}
                  alt={title}
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </Link>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-md">
              {badge}
            </span>
          </div>

          <button
            type="button"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const added = toggleItem({
                id,
                title,
                image,
                href,
                currentPrice,
                originalPrice,
              });
              toast.success(
                added ? "Saved to favorites" : "Removed from favorites",
              );
            }}
            className={cn(
              "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border backdrop-blur-md transition",
              isFavorite
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/60 text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>

          <button
            onClick={() => !isOutOfStock && setIsModalOpen(true)}
            disabled={isOutOfStock}
            className="absolute inset-x-4 bottom-4 flex translate-y-4 items-center justify-between rounded-full bg-foreground/95 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-background opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isOutOfStock ? "Sold Out" : "Quick Add"}
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Link href={href} className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {title}
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              VE Gear
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-xl font-semibold tracking-tight">
              {format(currentPrice)}
            </div>
            {originalPrice > currentPrice && (
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground line-through">
                {format(originalPrice)}
              </div>
            )}
          </div>
        </Link>
      </article>

      <ProductModal
        id={id}
        title={title}
        image={image}
        hoverImage={hoverImage}
        images={images}
        originalPrice={originalPrice}
        currentPrice={currentPrice}
        discount={discount}
        href={href}
        stock={stock}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
