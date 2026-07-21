"use client";

import { useProductStore } from "@/store/productStore";
import AvailabilityFilter from "./AvailabilityFilter";
import PriceFilter from "./PriceFilter";
import CategoryFilter from "./CategoryFilter";
import SortDropdown from "./SortDropdown";
import ProductCount from "./ProductCount";
import type { TransformedProduct } from "@/type/productType";
import type { Category } from "@/type/categoryType";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductFiltersProps {
  products: TransformedProduct[];
  filteredProducts: TransformedProduct[];
  categories: Category[];
}

export default function ProductFilters({
  products,
  filteredProducts,
  categories,
}: ProductFiltersProps) {
  const { resetFilters, filters } = useProductStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveFilters =
    filters.availability.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange.from !== null ||
    filters.priceRange.to !== null ||
    filters.searchQuery.trim().length > 0 ||
    filters.sortBy !== "price-low";

  const handleResetAll = () => {
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-normal">Filter:</span>
        <CategoryFilter products={products} categories={categories} />
        <AvailabilityFilter products={products} />
        <PriceFilter products={products} />
        <button
          onClick={handleResetAll}
          disabled={!hasActiveFilters}
          className={`text-sm font-normal border-b transition-colors ${
            hasActiveFilters
              ? "border-transparent hover:border-foreground cursor-pointer"
              : "border-transparent opacity-50 cursor-not-allowed"
          }`}
        >
          Reset all
        </button>
      </div>

      <div className="flex items-center gap-4">
        <SortDropdown />
        <ProductCount count={filteredProducts.length} />
      </div>
    </div>
  );
}
