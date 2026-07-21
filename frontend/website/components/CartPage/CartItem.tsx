"use client";

import { useCartStore } from "@/store/cartStore";
import ImageLoader from "@/components/Common/ImageLoader";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    image: string;
    currentPrice: number;
    size: string;
    quantity: number;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { format } = useCurrency();
  const itemTotal = item.currentPrice * item.quantity;

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:grid md:grid-cols-12">
      <div className="col-span-6 flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-32 md:w-32">
          <ImageLoader
            src={item.image}
            alt={item.title}
            width={128}
            height={128}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
            VE Gear
          </p>
          <h3 className="mb-1 text-sm font-medium md:text-base">{item.title}</h3>
          <p className="mb-1 text-xs text-muted-foreground">
            {format(item.currentPrice)}
          </p>
          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
        </div>
      </div>

      <div className="col-span-3 flex items-center justify-center gap-2 md:justify-start">
        <div className="flex w-fit items-center overflow-hidden rounded-full border border-border">
          <button
            onClick={() =>
              updateQuantity(item.id, item.size, item.quantity - 1)
            }
            disabled={item.quantity === 1}
            className={`flex items-center justify-center px-3 py-2 transition-colors ${
              item.quantity === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-white/5"
            }`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={item.quantity}
            readOnly
            className="w-12 border-0 bg-transparent text-center text-base focus:outline-none"
          />
          <button
            onClick={() =>
              updateQuantity(item.id, item.size, item.quantity + 1)
            }
            className="flex items-center justify-center px-3 py-2 transition-colors hover:bg-white/5"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => removeItem(item.id, item.size)}
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label="Remove item"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="col-span-3 flex items-center justify-end">
        <span className="font-display text-base font-semibold">
          {format(itemTotal)}
        </span>
      </div>
    </div>
  );
}
