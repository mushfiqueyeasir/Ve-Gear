import CheckoutPageScreen from "@/components/CheckoutPage/CheckoutPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";

export const metadata = generateSeoMetadata(SeoContent.checkoutSeo);

export default function CheckoutPage() {
  return <CheckoutPageScreen />;
}
