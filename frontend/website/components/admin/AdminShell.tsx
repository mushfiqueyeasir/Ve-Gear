"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { navItemsForRole, NAV_GROUPS } from "@/lib/admin/nav";
import { Icon } from "./Icon";
import { AdminProvider, type AdminContextValue } from "./AdminContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

/** White mark → black on light palettes (Daylight) via html[data-theme]. */
const logoToneClass = "transition-[filter] [[data-theme=light]_&]:brightness-0";

export default function AdminShell({
  session,
  children,
}: {
  session: AdminContextValue;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("ve-admin-collapsed") === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("ve-admin-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const items = navItemsForRole(session.role);
  const activeItem =
    items
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null;

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/admin/login");
    router.refresh();
  };

  const NavList = () => (
    <ScrollArea className="min-h-0 flex-1">
      <nav className="space-y-5 px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const groupItems = items.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              {!collapsed && (
                <p className="px-2.5 pb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = activeItem?.href === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-sidebar-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                        collapsed && "justify-center",
                      )}
                    >
                      <Icon name={item.icon} className="size-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );

  const SidebarInner = () => (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4",
          collapsed && "justify-center px-2",
        )}
      >
        {collapsed ? (
          <Image
            src="/images/logo/favicon.png"
            alt="VE Gear"
            width={64}
            height={64}
            className={cn("size-7", logoToneClass)}
          />
        ) : (
          <div>
            <Image
              src="/images/logo/logo-white.png"
              alt="VE Gear"
              width={400}
              height={160}
              className={cn("h-6 w-auto", logoToneClass)}
            />
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Admin
            </p>
          </div>
        )}
      </div>
      <NavList />
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground",
            collapsed && "justify-center",
          )}
          title="View storefront"
        >
          <ExternalLink className="size-4 shrink-0" />
          {!collapsed && <span>View store</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <AdminProvider value={session}>
      <div className="flex h-svh overflow-hidden bg-background text-foreground">
        <aside
          className={cn(
            "hidden h-full shrink-0 border-r border-sidebar-border transition-all lg:block",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <SidebarInner />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 border-r border-sidebar-border bg-sidebar shadow-2xl">
              <SidebarInner />
              <button
                className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md lg:px-6">
            <button
              className="grid size-11 place-items-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <button
              className="hidden size-11 place-items-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground lg:grid"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <ChevronRight className="size-5" />
              ) : (
                <ChevronLeft className="size-5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Admin</span>
                {activeItem && (
                  <>
                    <span className="text-border">/</span>
                    <span className="text-foreground">{activeItem.label}</span>
                  </>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 text-sm transition hover:border-primary/40">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {(session.fullName || session.email)
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-35 truncate font-medium leading-tight">
                      {session.fullName || session.email}
                    </span>
                    <span className="block text-[11px] leading-tight text-muted-foreground">
                      {ROLE_LABEL[session.role]}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-border bg-card"
              >
                <DropdownMenuLabel>
                  <div className="truncate">{session.email}</div>
                  <div className="text-xs font-normal text-muted-foreground">
                    {ROLE_LABEL[session.role]}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-primary focus:text-primary"
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <main className="admin-content relative p-4 lg:p-8">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </AdminProvider>
  );
}
