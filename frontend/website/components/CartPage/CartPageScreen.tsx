"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import CartItemsList from "./CartItemsList";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";

export default function CartPageScreen() {
  const { items, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <EmptyCart />
      </section>
    );
  }

  const total = getTotal();

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6 lg:mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Your cart
        </h1>
        <Link
          href="/product"
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        <CartItemsList />
        <CartSummary total={total} />
      </div>
    </section>
  );
}
