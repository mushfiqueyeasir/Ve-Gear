import AboutPageScreen from "@/components/AboutPage/AboutPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getAboutSections } from "@/utility/getAboutSections";

export const metadata = generateSeoMetadata(SeoContent.aboutUsSeo);
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AboutUsPage() {
  const sections = await getAboutSections();
  return <AboutPageScreen sections={sections} />;
}
