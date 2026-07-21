"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import SearchSidebar from "../SearchSidebar";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { isActivePath } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { MenuType } from "@/type/menyType";

interface NavbarProps {
  menuData: MenuType[];
  logoUrl: string;
  storeName: string;
}

export default function Navbar({ menuData, logoUrl, storeName }: NavbarProps) {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Storefront scrolls inside Radix ScrollArea, not window
    const viewport =
      headerRef.current?.closest("[data-radix-scroll-area-viewport]") ??
      document.querySelector("[data-radix-scroll-area-viewport]");

    const getScrollTop = () => {
      if (viewport instanceof HTMLElement) return viewport.scrollTop;
      return window.scrollY || document.documentElement.scrollTop;
    };

    const onScroll = () => setScrolled(getScrollTop() > 20);
    onScroll();

    viewport?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      viewport?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-border bg-background/60 backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={storeName}
          >
            <Image
              src={logoUrl}
              alt={storeName}
              width={160}
              height={40}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {menuData.map((menu, index) => {
              if (!menu.href) return null;
              const active = isActivePath(pathname, menu.href);
              return (
                <Link
                  key={index}
                  href={menu.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative text-[13px] font-medium uppercase tracking-[0.2em] transition",
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {menu.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-primary transition-all duration-500",
                      active ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <IconBtn label="Search" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </IconBtn>
            <Link
              href="/wishlist"
              aria-label="Favorites"
              aria-current={
                isActivePath(pathname, "/wishlist") ? "page" : undefined
              }
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/5",
                isActivePath(pathname, "/wishlist")
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground",
              )}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  (wishlistCount > 0 || isActivePath(pathname, "/wishlist")) &&
                    "fill-primary text-primary",
                )}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              aria-current={
                isActivePath(pathname, "/cart") ? "page" : undefined
              }
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/5",
                isActivePath(pathname, "/cart")
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground",
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
            <div className="ml-1 md:hidden">
              <MobileMenu
                menuData={menuData}
                logoUrl={logoUrl}
                storeName={storeName}
                trigger={
                  <button
                    className="grid h-10 w-10 place-items-center rounded-full border border-border"
                    aria-label="Menu"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </header>
      <SearchSidebar open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </button>
  );
}
