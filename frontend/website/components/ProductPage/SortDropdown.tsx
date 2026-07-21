"use client";

import { useProductStore } from "@/store/productStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import DropdownHeader from "./DropdownHeader";

export default function SortDropdown() {
  const { filters, setSortBy } = useProductStore();

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case "price-low":
        return "Price: Low to High";
      case "price-high":
        return "Price: High to Low";
      case "name-a-z":
        return "Name: A-Z";
      case "name-z-a":
        return "Name: Z-A";
      default:
        return "Price: Low to High";
    }
  };

  const sortOptions = [
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-a-z", label: "Name: A-Z" },
    { value: "name-z-a", label: "Name: Z-A" },
  ] as const;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-normal outline-none border-b border-transparent hover:border-black transition-colors">
        Sort by: {getSortLabel()}
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0">
        <DropdownHeader
          selectedCount={filters.sortBy !== "price-low" ? 1 : 0}
          onReset={() => setSortBy("price-low")}
          label="selected"
        />
        <DropdownMenuSeparator />
        <div className="p-2 space-y-1">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded"
            >
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={() =>
                  setSortBy(option.value as typeof filters.sortBy)
                }
                className="w-4 h-4 border border-gray-300 rounded-full text-black focus:ring-2 focus:ring-black focus:ring-offset-0"
              />
              <span className="text-sm font-normal text-black">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
