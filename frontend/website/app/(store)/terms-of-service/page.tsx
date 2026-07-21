import CmsPageScreen from "@/components/CmsPage/CmsPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getContentPage } from "@/utility/getContentPage";

export const metadata = generateSeoMetadata(SeoContent.termsOfServiceSeo);
export const revalidate = 0;

export default async function TermsOfServicePage() {
  const page = await getContentPage("terms");
  return (
    <CmsPageScreen
      eyebrow="Legal"
      title={page.title}
      bodyHtml={page.body_html}
    />
  );
}
