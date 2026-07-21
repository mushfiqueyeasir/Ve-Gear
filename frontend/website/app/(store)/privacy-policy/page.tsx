import CmsPageScreen from "@/components/CmsPage/CmsPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getContentPage } from "@/utility/getContentPage";

export const metadata = generateSeoMetadata(SeoContent.privacyPolicySeo);
export const revalidate = 0;

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
