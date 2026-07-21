import CheckoutPageScreen from "@/components/CheckoutPage/CheckoutPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getSiteSettings } from "@/utility/getSettings";

export const metadata = generateSeoMetadata(SeoContent.checkoutSeo);
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CheckoutPage() {
  const settings = await getSiteSettings();

  return <CheckoutPageScreen deliveryCharges={settings.deliveryCharges} />;
}
