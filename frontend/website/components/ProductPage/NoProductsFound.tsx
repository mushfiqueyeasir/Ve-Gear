"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import { PackageX } from "lucide-react";

export default function NoProductsFound() {
  const { resetFilters } = useProductStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearAllFilters = () => {
    resetFilters();
    const newSearchParams = new URLSearchParams();
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      newSearchParams.set("category", categoryParam);
    }
    const newUrl = `/product${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
    router.push(newUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 lg:py-24 px-4">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
        <PackageX className="h-9 w-9 text-foreground/40" />
      </div>
      <h3 className="mb-3 text-center font-display text-2xl text-foreground lg:text-3xl">
        No products found
      </h3>
      <p className="mb-6 max-w-md text-center text-sm text-foreground/60 lg:text-base">
        We couldn't find any products matching your filters. Try adjusting your
        search criteria or clear all filters to see all products.
      </p>
      <button
        onClick={handleClearAllFilters}
        className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary"
      >
        Clear all filters
      </button>
    </div>
  );
}
