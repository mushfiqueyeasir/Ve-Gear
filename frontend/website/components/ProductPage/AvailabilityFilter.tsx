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
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-normal outline-none border-b border-transparent hover:border-foreground transition-colors">
        Availability
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0">
        <DropdownHeader selectedCount={selectedCount} onReset={resetFilters} />
        <DropdownMenuSeparator />
        <div className="p-2 space-y-1">
          <label className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-white/5 rounded">
            <input
              type="checkbox"
              checked={isInStock}
              onChange={() => toggleAvailability("in-stock")}
              className="w-4 h-4 border border-border rounded text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm font-normal text-foreground">
              In stock ({availabilityCounts.inStock})
            </span>
          </label>
          <label className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-white/5 rounded">
            <input
              type="checkbox"
              checked={isOutOfStock}
              onChange={() => toggleAvailability("out-of-stock")}
              className="w-4 h-4 border border-border rounded text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-0"
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
