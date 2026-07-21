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
            className="grid h-10 w-10 place-items-center rounded-full border border-border"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[300px] flex-col border-border bg-background p-0 text-foreground sm:w-[360px]"
      >
        <div className="border-b border-border px-5 py-5">
          <Link href="/" onClick={() => setIsSheetOpen(false)}>
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
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5",
                  active ? "bg-primary/10 text-primary" : "text-foreground",
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-5 py-4">
          <div className="flex items-center justify-center gap-5">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
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
