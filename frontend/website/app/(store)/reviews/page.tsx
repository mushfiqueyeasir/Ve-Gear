import ReviewPageScreen from "@/components/ReviewPage/ReviewPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getReviews, transformReview } from "@/utility/getReview";

export const metadata = generateSeoMetadata(SeoContent.reviewsSeo);
export const revalidate = 0;

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewPageScreen reviews={reviews.map(transformReview)} />;
}
