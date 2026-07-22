import type { Metadata } from "next";
import ContactPageScreen from "@/components/ContactPage/ContactPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("contact"));
}

export default function ContactUsPage() {
  return <ContactPageScreen />;
}
