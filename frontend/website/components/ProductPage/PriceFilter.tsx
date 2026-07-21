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

interface PriceFilterProps {
  products: TransformedProduct[];
}

export default function PriceFilter({ products }: PriceFilterProps) {
  const { filters, setPriceRange } = useProductStore();

  const highestPrice = useMemo(() => {
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
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-normal outline-none border-b border-transparent hover:border-foreground transition-colors">
        Price
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm text-gray-600">
            The highest price is Tk {highestPrice.toLocaleString()}.00
          </span>
          {isPriceFilterActive && (
            <button
              onClick={() => setPriceRange(null, null)}
              className="text-sm text-foreground underline hover:no-underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">৳</span>
            <input
              type="number"
              placeholder="From"
              value={filters.priceRange.from ?? ""}
              onChange={(e) => handlePriceFrom(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded outline-none focus:border-black text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">৳</span>
            <input
              type="number"
              placeholder="To"
              value={filters.priceRange.to ?? ""}
              onChange={(e) => handlePriceTo(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded outline-none focus:border-black text-sm"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
