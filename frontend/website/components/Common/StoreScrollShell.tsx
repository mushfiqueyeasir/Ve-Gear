"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Marks the storefront for branded native scrollbar styles.
 * Uses document scroll (not Radix) so wheel/trackpad stay compositor-smooth.
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

  return <>{children}</>;
}
