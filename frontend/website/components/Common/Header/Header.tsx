import Navbar from "./Navbar";
import type { Category } from "@/type/categoryType";
import type { SiteSettings } from "@/utility/getSettings";
import { getMenuData } from "@/constant/menuData";

interface HeaderProps {
  categories: Category[];
  settings: SiteSettings;
}

export default function Header({ settings }: HeaderProps) {
  const menuData = getMenuData();
  const logoUrl = settings.logoUrl || "/images/logo/logo-white.png";
  const storeName = settings.store_name || "VE Gear";

  return <Navbar menuData={menuData} logoUrl={logoUrl} storeName={storeName} />;
}
