"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProductStore } from "@/store/productStore";

interface SearchSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchSidebar({
  open,
  onOpenChange,
}: SearchSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { filters, setSearchQuery } = useProductStore();
  const [searchQuery, setLocalSearchQuery] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setLocalSearchQuery(filters.searchQuery);
    } else {
      setLocalSearchQuery("");
    }
  }, [open, filters.searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearchQuery(query);

      if (pathname !== "/product") {
        router.push("/product");
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setSearchQuery(searchQuery);

      const searchParams = new URLSearchParams();
      if (searchQuery.trim()) {
        searchParams.set("search", searchQuery.trim());
      }

      const newUrl = `/product${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.push(newUrl);
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setLocalSearchQuery("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setSearchQuery("");
    router.push("/product");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="w-full p-0 flex flex-col">
        <SheetHeader className="px-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-normal">
              Search Products
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>
        <div className="flex-1 px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-none focus:outline-none focus:border-black transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-4 text-sm text-gray-600">
                Searching for:{" "}
                <span className="font-medium">{searchQuery}</span>
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
