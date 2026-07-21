"use client";

import { useEffect, type ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Full-viewport branded scroll area for the storefront.
 * Matches the dark UI with a slim coral-accent thumb.
 */
export default function StoreScrollShell({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("store-scroll");
    return () => root.classList.remove("store-scroll");
  }, []);

  return (
    <ScrollArea variant="brand" className="h-dvh w-full">
      {children}
    </ScrollArea>
  );
}
