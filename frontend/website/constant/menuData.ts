import { MenuType } from "@/type/menyType";

export function getMenuData(): MenuType[] {
  return [
    {
      label: "Shop",
      href: "/product",
    },
    {
      label: "About",
      href: "/about-us",
    },
    {
      label: "Reviews",
      href: "/reviews",
    },
    {
      label: "Contact",
      href: "/contact-us",
    },
  ];
}
