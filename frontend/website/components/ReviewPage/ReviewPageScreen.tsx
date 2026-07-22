import ReviewCard from "@/components/Common/ReviewCard";
import type { TransformedReview } from "@/type/reviewType";

export default function ReviewPageScreen({
  reviews,
}: {
  reviews: TransformedReview[];
}) {
  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-24 md:px-10 md:pt-36">
      <div className="mb-10 text-center lg:mb-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          The Community
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Customer Reviews
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Real photos and feedback from the VE Gear community.
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="py-16 text-center text-foreground/50">
          No reviews yet. Check back soon.
        </p>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((review) => (
            <div key={review.id} className="mb-5 break-inside-avoid">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
