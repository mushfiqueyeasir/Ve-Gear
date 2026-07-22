import type { Metadata } from "next";
import CheckoutPageScreen from "@/components/CheckoutPage/CheckoutPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";
import { getSiteSettings } from "@/utility/getSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("checkout"));
}

export default async function CheckoutPage() {
  const settings = await getSiteSettings();

  return <CheckoutPageScreen deliveryCharges={settings.deliveryCharges} />;
}
