"use client";

import { useMemo } from "react";
import { useProductStore } from "@/store/productStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { TransformedProduct } from "@/type/productType";
import DropdownHeader from "./DropdownHeader";
import { filterTriggerClass } from "./filterTrigger";

interface AvailabilityFilterProps {
  products: TransformedProduct[];
}

export default function AvailabilityFilter({
  products,
}: AvailabilityFilterProps) {
  const { filters, setAvailability, resetFilters } = useProductStore();

  const availabilityCounts = useMemo(() => {
    let inStock = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const totalQuantity =
        product.stock?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      if (totalQuantity > 0) {
        inStock++;
      } else {
        outOfStock++;
      }
    });

    return { inStock, outOfStock };
  }, [products]);

  const selectedCount = filters.availability.length;

  const toggleAvailability = (value: string) => {
    const current = filters.availability;
    if (current.includes(value)) {
      setAvailability(current.filter((v) => v !== value));
    } else {
      setAvailability([...current, value]);
    }
  };

  const isInStock = filters.availability.includes("in-stock");
  const isOutOfStock = filters.availability.includes("out-of-stock");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={filterTriggerClass}>
        <span className="sm:hidden">Stock</span>
        <span className="hidden sm:inline">Availability</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(16rem,calc(100vw-2rem))] p-0">
        <DropdownHeader selectedCount={selectedCount} onReset={resetFilters} />
        <DropdownMenuSeparator />
        <div className="space-y-1 p-2">
          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-3 hover:bg-foreground/5">
            <input
              type="checkbox"
              checked={isInStock}
              onChange={() => toggleAvailability("in-stock")}
              className="h-4 w-4 rounded border border-border text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm font-normal text-foreground">
              In stock ({availabilityCounts.inStock})
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-3 hover:bg-foreground/5">
            <input
              type="checkbox"
              checked={isOutOfStock}
              onChange={() => toggleAvailability("out-of-stock")}
              className="h-4 w-4 rounded border border-border text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm font-normal text-foreground">
              Out of stock ({availabilityCounts.outOfStock})
            </span>
          </label>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
