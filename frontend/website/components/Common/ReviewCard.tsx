import ImageLoader from "./ImageLoader";
import type { TransformedReview } from "@/type/reviewType";

interface ReviewCardProps {
  review: TransformedReview;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white/5">
      <ImageLoader
        src={review.image}
        alt={
          review.customerName
            ? `Review by ${review.customerName}`
            : `Review ${review.id}`
        }
        width={500}
        height={500}
        className="h-auto w-full"
      />
    </div>
  );
}
