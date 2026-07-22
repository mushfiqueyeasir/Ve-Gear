import type { Metadata } from "next";
import CmsPageScreen from "@/components/CmsPage/CmsPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";
import { getContentPage } from "@/utility/getContentPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("privacy"));
}

export default async function PrivacyPolicyPage() {
  const page = await getContentPage("privacy");
  return (
    <CmsPageScreen
      eyebrow="Legal"
      title={page.title}
      bodyHtml={page.body_html}
    />
  );
}
