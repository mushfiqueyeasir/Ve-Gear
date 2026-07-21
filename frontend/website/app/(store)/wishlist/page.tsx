import WishlistPageScreen from "@/components/WishlistPage/WishlistPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";

export const metadata = generateSeoMetadata(SeoContent.wishlistSeo);

export default function WishlistPage() {
  return <WishlistPageScreen />;
}
