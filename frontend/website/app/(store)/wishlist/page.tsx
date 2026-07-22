import type { Metadata } from "next";
import WishlistPageScreen from "@/components/WishlistPage/WishlistPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("wishlist"));
}

export default function WishlistPage() {
  return <WishlistPageScreen />;
}
