import { Star } from "lucide-react";
import ImageLoader from "./ImageLoader";
import { cn } from "@/lib/utils";
import type { TransformedReview } from "@/type/reviewType";

interface ReviewCardProps {
  review: TransformedReview;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const rating = Math.min(5, Math.max(0, Math.round(review.rating ?? 0)));
  const name = review.customerName?.trim() || "VE Gear customer";
  const body = review.body?.trim();
  const hasImage = Boolean(review.image);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-foreground/20 hover:ring-glow">
      {hasImage && (
        <div className="relative aspect-4/5 overflow-hidden bg-surface">
          <ImageLoader
            src={review.image}
            alt={
              review.customerName
                ? `Review by ${review.customerName}`
                : `Review ${review.id}`
            }
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {rating > 0 && (
          <div
            className="flex gap-0.5 text-primary"
            aria-label={`${rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4",
                  i < rating ? "fill-primary text-primary" : "text-border",
                )}
              />
            ))}
          </div>
        )}

        <h3
          className={cn(
            "font-display text-base font-semibold tracking-tight sm:text-lg",
            rating > 0 ? "mt-3" : "",
          )}
        >
          {name}
        </h3>

        {body && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            &ldquo;{body}&rdquo;
          </p>
        )}
      </div>
    </article>
  );
}
