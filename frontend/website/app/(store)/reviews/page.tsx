import ReviewPageScreen from "@/components/ReviewPage/ReviewPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";

export const metadata = generateSeoMetadata(SeoContent.reviewsSeo);
export const revalidate = 0;

export default function ReviewsPage() {
  return <ReviewPageScreen />;
}
