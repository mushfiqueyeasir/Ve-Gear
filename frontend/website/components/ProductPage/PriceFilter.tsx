"use client";

import { useMemo } from "react";
import { useProductStore } from "@/store/productStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { TransformedProduct } from "@/type/productType";
import { filterTriggerClass } from "./filterTrigger";

interface PriceFilterProps {
  products: TransformedProduct[];
}

export default function PriceFilter({ products }: PriceFilterProps) {
  const { filters, setPriceRange } = useProductStore();

  const highestPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((p) => p.currentPrice));
  }, [products]);

  const handlePriceFrom = (value: string) => {
    const numValue = value === "" ? null : Number(value);
    setPriceRange(numValue, filters.priceRange.to);
  };

  const handlePriceTo = (value: string) => {
    const numValue = value === "" ? null : Number(value);
    setPriceRange(filters.priceRange.from, numValue);
  };

  const isPriceFilterActive =
    filters.priceRange.from !== null || filters.priceRange.to !== null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={filterTriggerClass}>
        Price
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(20rem,calc(100vw-2rem))] p-0">
        <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-3">
          <span className="min-w-0 text-sm text-muted-foreground">
            Highest: ৳{highestPrice.toLocaleString()}
          </span>
          {isPriceFilterActive && (
            <button
              type="button"
              onClick={() => setPriceRange(null, null)}
              className="shrink-0 text-sm text-foreground underline hover:no-underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">৳</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="From"
              value={filters.priceRange.from ?? ""}
              onChange={(e) => handlePriceFrom(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">৳</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="To"
              value={filters.priceRange.to ?? ""}
              onChange={(e) => handlePriceTo(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
