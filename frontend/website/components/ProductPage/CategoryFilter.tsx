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
import type { Category } from "@/type/categoryType";
import DropdownHeader from "./DropdownHeader";

interface CategoryFilterProps {
  products: TransformedProduct[];
  categories: Category[];
}

export default function CategoryFilter({
  products,
  categories,
}: CategoryFilterProps) {
  const { filters, setCategories } = useProductStore();

  const availableCategories = useMemo(() => {
    const productCategoryCounts = new Map<string, number>();

    products.forEach((product) => {
      product.categories.forEach((category) => {
        const categoryId = category.categoryUrl.current;
        productCategoryCounts.set(
          categoryId,
          (productCategoryCounts.get(categoryId) || 0) + 1,
        );
      });
    });

    return categories
      .map((category) => ({
        id: category.categoryUrl.current,
        name: category.categoryName,
        count: productCategoryCounts.get(category.categoryUrl.current) || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categories]);

  const selectedCount = filters.categories.length;

  const toggleCategory = (categoryId: string) => {
    const current = filters.categories;
    if (current.includes(categoryId)) {
      setCategories(current.filter((id) => id !== categoryId));
    } else {
      setCategories([...current, categoryId]);
    }
  };

  const resetCategoryFilter = () => {
    setCategories([]);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-normal outline-none border-b border-transparent hover:border-foreground transition-colors">
        Category
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0 max-h-96 overflow-y-auto">
        <DropdownHeader
          selectedCount={selectedCount}
          onReset={resetCategoryFilter}
        />
        <DropdownMenuSeparator />
        <div className="p-2 space-y-1">
          {availableCategories.map((category) => {
            const isSelected = filters.categories.includes(category.id);
            return (
              <label
                key={category.id}
                className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-white/5 rounded"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 border border-border rounded text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm font-normal text-foreground">
                  {category.name} ({category.count})
                </span>
              </label>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
