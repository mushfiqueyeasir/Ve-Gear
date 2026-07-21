"use client";

import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import ImageLoader from "@/components/Common/ImageLoader";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import {
  deliveryZoneLabel,
  shippingCostForZone,
  type DeliveryCharges,
} from "@/lib/delivery";

export default function CheckoutOrderSummary({
  deliveryCharges,
}: {
  deliveryCharges: DeliveryCharges;
}) {
  const { items, getTotal } = useCartStore();
  const shippingMethod = useCheckoutStore((s) => s.formData.shippingMethod);
  const { format, code } = useCurrency();

  const subtotal = getTotal();
  const shipping = shippingCostForZone(deliveryCharges, shippingMethod);
  const total = subtotal + shipping;

  return (
    <div className="w-full max-w-none rounded-2xl border border-border bg-card p-5 sm:p-6 lg:max-w-sm">
      <h2 className="mb-6 font-display text-xl font-semibold">Order summary</h2>

      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex gap-4">
            <div className="relative h-20 w-20 shrink-0">
              <ImageLoader
                src={item.image}
                alt={item.title}
                width={80}
                height={80}
                className="h-full w-full rounded-lg object-cover"
              />
              <div className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {item.quantity}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 truncate text-sm font-medium">{item.title}</p>
              <p className="mb-1 text-xs text-muted-foreground">
                Size: {item.size}
              </p>
              <p className="text-sm">{format(item.currentPrice)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Delivery · {deliveryZoneLabel(shippingMethod)}
          </span>
          <span>{format(shipping)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <span>Total ({code})</span>
          <span className="font-display text-xl">{format(total)}</span>
        </div>
      </div>
    </div>
  );
}
