"use client";

import { socialLinks } from "@/constant/socialLinks";
import { MenuType } from "@/type/menyType";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { isActivePath } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  menuData: MenuType[];
  logoUrl: string;
  storeName: string;
  trigger?: ReactNode;
}

export default function MobileMenu({
  menuData,
  logoUrl,
  storeName,
  trigger,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <button
            className="grid size-11 place-items-center rounded-full border border-border"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[min(100vw-2.5rem,22rem)] flex-col border-border bg-background p-0 text-foreground"
      >
        <div className="flex items-center border-b border-border py-5 pl-5 pr-16">
          <Link
            href="/"
            onClick={() => setIsSheetOpen(false)}
            className="inline-flex min-h-11 items-center"
          >
            <Image
              src={logoUrl}
              alt={storeName}
              width={400}
              height={160}
              className="h-7 w-auto"
            />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {menuData.map((menu: MenuType, index) => {
            if (!menu.href) return null;
            const active = isActivePath(pathname, menu.href);

            return (
              <Link
                key={index}
                href={menu.href}
                onClick={() => setIsSheetOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3.5 text-base font-medium transition-colors hover:bg-foreground/5",
                  active ? "bg-primary/10 text-primary" : "text-foreground",
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          <div className="flex items-center justify-center gap-2">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
                  aria-label={social.label}
                >
                  <IconComponent size={22} />
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
