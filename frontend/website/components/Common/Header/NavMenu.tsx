"use client";

import { MenuType } from "@/type/menyType";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface NavMenuProps {
  menuData: MenuType[];
}

const linkBase =
  "text-[13px] uppercase tracking-[0.12em] transition-colors duration-200";

export default function NavMenu({ menuData }: NavMenuProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 py-3">
      {menuData.map((menu: MenuType, index) => {
        if (!menu.href) return null;
        const active = isActivePath(pathname, menu.href);

        return (
          <Link
            key={index}
            href={menu.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              linkBase,
              active ? "text-primary" : "text-foreground/70 hover:text-primary",
            )}
          >
            {menu.label}
          </Link>
        );
      })}
    </div>
  );
}
