"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  Package,
  Star,
  RotateCcw,
  Wallet,
  Heart,
  Ruler,
} from "lucide-react";
import { toast } from "sonner";
import type { TransformedProduct, ProductStock } from "@/type/productType";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { trackAddToCart } from "@/utility/analytics/facebookPixelEvents";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SizeChart from "./SizeChart";

interface ProductInfoProps {
  product: TransformedProduct;
  stock?: ProductStock[];
}

const FALLBACK_SIZES = ["M", "L", "XL", "2XL"] as const;

export default function ProductInfo({ product, stock }: ProductInfoProps) {
  const sizeOptions =
    stock && stock.length > 0 ? stock.map((s) => s.size) : [...FALLBACK_SIZES];

  const isFullyOutOfStock = (() => {
    if (!stock || stock.length === 0) return true;
    return stock.reduce((sum, item) => sum + (item.quantity || 0), 0) === 0;
  })();

  const getInitialSize = (): string | null => {
    if (isFullyOutOfStock) return null;
    return stock?.find((s) => s.quantity > 0)?.size ?? null;
  };

  const [selectedSize, setSelectedSize] = useState<string | null>(
    getInitialSize(),
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { addItem, isItemInCart } = useCartStore();
  const isFavorite = useWishlistStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useWishlistStore((s) => s.toggleItem);
  const { format, code } = useCurrency();
  const router = useRouter();

  const hasSizeChart = (product.sizeChart?.length ?? 0) > 0;
  const selectedSizeStock = selectedSize
    ? stock?.find((s) => s.size === selectedSize)
    : null;
  const maxQuantity = selectedSizeStock?.quantity || 0;
  const isInCart = selectedSize
    ? isItemInCart(product.id, selectedSize)
    : false;

  useEffect(() => {
    if (!selectedSize) {
      setQuantity(0);
    } else if (maxQuantity === 0) {
      setQuantity(0);
    } else if (quantity > maxQuantity || quantity === 0) {
      setQuantity(1);
    }
  }, [selectedSize, maxQuantity, quantity]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (maxQuantity > 0 && next > maxQuantity) return maxQuantity;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize || maxQuantity === 0 || quantity === 0) return;
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      size: selectedSize,
      quantity,
    });
    trackAddToCart(product.id, product.currentPrice, code, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize || maxQuantity === 0 || quantity === 0) return;
    addItem({
      id: product.id,
      title: product.title,
      image: product.image,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      size: selectedSize,
      quantity,
    });
    trackAddToCart(product.id, product.currentPrice, code, quantity);
    router.push("/cart");
  };

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
        VE Gear
      </p>
      <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground lg:text-4xl">
        {product.title}
      </h1>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-medium text-foreground lg:text-3xl">
            {format(product.currentPrice)}
          </span>
          {product.discount && product.discount > 0 && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {product.discount}% OFF
            </span>
          )}
        </div>
        {product.originalPrice > product.currentPrice && (
          <span className="block text-sm text-muted-foreground line-through">
            {format(product.originalPrice)}
          </span>
        )}
        <p className="text-sm text-muted-foreground">Tax included.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-normal text-foreground">
            Size
          </label>
          {hasSizeChart && (
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground underline-offset-4 transition hover:text-primary hover:underline"
            >
              <Ruler className="size-3.5" />
              Size chart
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {sizeOptions.map((size) => {
            const sizeStock = stock?.find((s) => s.size === size);
            const isAvailable = (sizeStock?.quantity || 0) > 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => isAvailable && setSelectedSize(size)}
                disabled={!isAvailable}
                className={cn(
                  "size-12 rounded-full border text-sm font-medium transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : isAvailable
                      ? "border-border bg-card text-foreground hover:border-foreground"
                      : "cursor-not-allowed border-border/10 bg-black/5 text-foreground/30",
                )}
                title={!isAvailable ? "Out of stock" : undefined}
              >
                {size}
              </button>
            );
          })}
        </div>
        {!selectedSize && isFullyOutOfStock && (
          <p className="mt-2 text-xs text-red-500">
            All sizes are out of stock
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-normal text-foreground">
          Quantity
        </label>
        <div className="flex w-fit items-center rounded-full border border-foreground/20">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="flex items-center justify-center px-4 py-2 text-base transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            value={quantity}
            readOnly
            className="w-16 border-0 bg-transparent text-center text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={maxQuantity > 0 && quantity >= maxQuantity}
            className="flex items-center justify-center px-4 py-2 text-base transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {selectedSize && maxQuantity > 0 && maxQuantity <= 5 && (
          <p className="text-xs text-primary">Only {maxQuantity} left</p>
        )}
        {selectedSize && maxQuantity === 0 && (
          <p className="text-xs text-red-500">Out of stock</p>
        )}
      </div>

      <div className="space-y-3 pt-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={
            !selectedSize || isInCart || maxQuantity === 0 || quantity === 0
          }
          className={cn(
            "w-full rounded-full border px-4 py-3.5 text-sm font-medium transition-colors duration-200",
            !selectedSize || isInCart || maxQuantity === 0 || quantity === 0
              ? "cursor-not-allowed border-border/10 bg-black/5 text-foreground/40"
              : "border-foreground text-foreground hover:bg-foreground hover:text-background",
          )}
        >
          {!selectedSize
            ? "Select a size"
            : isInCart
              ? "Added to cart"
              : maxQuantity === 0
                ? "Out of stock"
                : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!selectedSize || maxQuantity === 0 || quantity === 0}
          className="w-full rounded-full bg-primary px-4 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy it now
        </button>
        <button
          type="button"
          onClick={() => {
            const added = toggleFavorite({
              id: product.id,
              title: product.title,
              image: product.image,
              href: product.href,
              currentPrice: product.currentPrice,
              originalPrice: product.originalPrice,
            });
            toast.success(
              added ? "Saved to favorites" : "Removed from favorites",
            );
          }}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3.5 text-sm font-medium transition-colors duration-200",
            isFavorite
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-foreground hover:border-primary hover:text-primary",
          )}
        >
          <Heart className={cn("size-4", isFavorite && "fill-current")} />
          {isFavorite ? "Saved to favorites" : "Add to favorites"}
        </button>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <Package className="size-5 text-foreground" />
          <span className="text-sm text-foreground">
            2 to 3 working days for metro cities
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Package className="size-5 text-foreground" />
          <span className="text-sm text-foreground">
            3 to 5 working days for rest of Bangladesh.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Star className="size-5 text-foreground" />
          <span className="text-sm text-foreground">Experience the Luxury</span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="size-5 text-foreground" />
          <span className="text-sm text-foreground">Easy Return</span>
        </div>
        <div className="flex items-center gap-3">
          <Wallet className="size-5 text-foreground" />
          <span className="text-sm text-foreground">Full Cash On Delivery</span>
        </div>
      </div>

      {hasSizeChart && (
        <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Size chart
              </DialogTitle>
            </DialogHeader>
            <SizeChart sizeChart={product.sizeChart} compact />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
