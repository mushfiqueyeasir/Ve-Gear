import CartPageScreen from "@/components/CartPage/CartPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";

export const metadata = generateSeoMetadata(SeoContent.cartSeo);

export default function CartPage() {
  return <CartPageScreen />;
}
