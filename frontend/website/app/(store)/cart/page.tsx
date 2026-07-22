import type { Metadata } from "next";
import CartPageScreen from "@/components/CartPage/CartPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("cart"));
}

export default function CartPage() {
  return <CartPageScreen />;
}
