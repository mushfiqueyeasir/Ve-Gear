"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductCardProps } from "./ProductCard";
import ImageLoader from "./ImageLoader";
import { useCartStore } from "@/store/cartStore";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { trackAddToCart } from "@/utility/analytics/facebookPixelEvents";

interface ProductModalProps extends ProductCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sizes = ["M", "L", "XL", "2XL"] as const;

export default function ProductModal({
  id,
  title,
  image,
  originalPrice,
  currentPrice,
  discount,
  href,
  stock,
  open,
  onOpenChange,
}: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<"M" | "L" | "XL" | "2XL">(
    "M",
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { format, code } = useCurrency();
  const router = useRouter();

  const selectedSizeStock = stock?.find((s) => s.size === selectedSize);
  const maxQuantity = selectedSizeStock?.quantity || 0;

  useEffect(() => {
    if (open) {
      const firstAvailableSize =
        stock?.find((s) => s.quantity > 0)?.size || "M";
      setSelectedSize(firstAvailableSize as "M" | "L" | "XL" | "2XL");
      setQuantity(1);
    }
  }, [open, stock]);

  useEffect(() => {
    if (maxQuantity === 0) {
      setQuantity(0);
    } else if (maxQuantity > 0 && quantity > maxQuantity) {
      setQuantity(maxQuantity);
    } else if (maxQuantity > 0 && quantity === 0) {
      setQuantity(1);
    }
  }, [selectedSize, maxQuantity, quantity]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      if (newQuantity < 1) return 1;
      if (maxQuantity > 0 && newQuantity > maxQuantity) return maxQuantity;
      return newQuantity;
    });
  };

  const handleAddToCart = () => {
    if (maxQuantity === 0 || quantity === 0) return;
    addItem({
      id,
      title,
      image,
      currentPrice,
      originalPrice,
      size: selectedSize,
      quantity,
    });
    // Track AddToCart event for Meta catalog ads
    trackAddToCart(id, currentPrice, code, quantity);
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    if (maxQuantity === 0 || quantity === 0) return;
    addItem({
      id,
      title,
      image,
      currentPrice,
      originalPrice,
      size: selectedSize,
      quantity,
    });
    // Track AddToCart event for Meta catalog ads
    trackAddToCart(id, currentPrice, code, quantity);
    onOpenChange(false);
    router.push("/cart");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-full p-4 sm:p-6 lg:p-0 gap-0 overflow-hidden overflow-y-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-none rounded-2xl">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:h-[600px] shrink-0">
            <ImageLoader
              src={image}
              alt={title}
              width={1000}
              height={1000}
              className="object-cover w-full h-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              <h2 className="font-display text-2xl leading-tight tracking-tight text-foreground lg:text-3xl">
                {title}
              </h2>

              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-medium text-foreground lg:text-2xl">
                    {format(currentPrice)}
                  </span>
                  {discount && discount > 0 && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                {originalPrice > currentPrice && (
                  <span className="text-sm text-gray-500 line-through block">
                    {format(originalPrice)}
                  </span>
                )}
                <p className="text-sm text-gray-600">Tax included.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-sm text-foreground">
                    Size
                  </label>
                </div>
                <div className="flex gap-3">
                  {sizes.map((size) => {
                    const sizeStock = stock?.find((s) => s.size === size);
                    const isAvailable = (sizeStock?.quantity || 0) > 0;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`size-10 rounded-full border text-sm font-medium transition-colors ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : isAvailable
                              ? "border-border bg-card text-foreground hover:border-foreground"
                              : "cursor-not-allowed border-border bg-white/5 text-foreground/30"
                        }`}
                        title={!isAvailable ? "Out of stock" : undefined}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm text-foreground">Quantity</label>
                <div className="flex w-fit items-center rounded-full border border-border">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center px-3 py-2 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-16 border-0 bg-transparent text-center text-base focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={maxQuantity > 0 && quantity >= maxQuantity}
                    className="flex items-center justify-center px-3 py-2 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {maxQuantity > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Available: {maxQuantity}{" "}
                    {maxQuantity === 1 ? "item" : "items"}
                  </p>
                )}
                {maxQuantity === 0 && (
                  <p className="text-xs text-red-500">Out of stock</p>
                )}
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={maxQuantity === 0 || quantity === 0}
                  className="w-full rounded-full border border-foreground py-3 px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground"
                >
                  Add to cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={maxQuantity === 0 || quantity === 0}
                  className="w-full rounded-full bg-primary py-3 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Buy it now
                </button>
              </div>

              <Link
                href={href}
                className="group flex items-center gap-2 text-sm text-foreground hover:underline"
                onClick={() => onOpenChange(false)}
              >
                View full details
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
