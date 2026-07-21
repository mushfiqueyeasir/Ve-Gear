import ContactPageScreen from "@/components/ContactPage/ContactPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";

export const metadata = generateSeoMetadata(SeoContent.contactUsSeo);

export default function ContactUsPage() {
  return <ContactPageScreen />;
}
