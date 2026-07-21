/** True when the current pathname matches a nav/footer href. */
export function isActivePath(pathname: string, href: string): boolean {
  if (!href || href === "#") return false;

  const path = href.split("?")[0];
  if (!path) return false;

  if (path === "/") return pathname === "/";

  // Shop covers the product listing and product detail pages
  if (path === "/product") {
    return pathname === "/product" || pathname.startsWith("/product/");
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
