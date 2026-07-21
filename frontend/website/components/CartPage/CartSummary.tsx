"use client";

import Link from "next/link";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface CartSummaryProps {
  total: number;
}

export default function CartSummary({ total }: CartSummaryProps) {
  const { format } = useCurrency();

  return (
    <div className="ml-auto w-full max-w-sm text-end">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="mb-2 text-base text-muted-foreground">
            Estimated total
          </h2>
          <p className="font-display text-3xl font-semibold">{format(total)}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Local fulfillment — no shipping charge.
        </p>
        <Link
          href="/checkout"
          className="block w-full rounded-full bg-foreground px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-wider text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          Check out
        </Link>
      </div>
    </div>
  );
}
