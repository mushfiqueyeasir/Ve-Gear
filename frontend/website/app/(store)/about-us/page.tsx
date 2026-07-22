import type { Metadata } from "next";
import AboutPageScreen from "@/components/AboutPage/AboutPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";
import { getAboutSections } from "@/utility/getAboutSections";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("about"));
}

export default async function AboutUsPage() {
  const sections = await getAboutSections();
  return <AboutPageScreen sections={sections} />;
}
