"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useProductStore } from "@/store/productStore";
import type { TransformedProduct } from "@/type/productType";
import type { Category } from "@/type/categoryType";

import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

interface ProductPageScreenProps {
  products: TransformedProduct[];
  categories: Category[];
}

export default function ProductPageScreen({
  products,
  categories,
}: ProductPageScreenProps) {
  const searchParams = useSearchParams();
  const { getFilteredProducts, filters, setCategories, setSearchQuery } =
    useProductStore();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      const categorySlug = categoryParam.trim();
      if (categorySlug) {
        setCategories([categorySlug]);
      }
    }

    const searchParam = searchParams.get("search");
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    } else if (filters.searchQuery && !searchParam) {
      setSearchQuery("");
    }
  }, [searchParams, setCategories, setSearchQuery, filters.searchQuery]);

  const filteredProducts = useMemo(() => {
    return getFilteredProducts(products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, getFilteredProducts, filters]);

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          The Collection
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight md:text-7xl">
          Shop all
        </h1>
      </div>
      <ProductFilters
        products={products}
        filteredProducts={filteredProducts}
        categories={categories}
      />
      <ProductGrid products={filteredProducts} />
    </section>
  );
}
