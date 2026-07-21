import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { TransformedReview } from "@/type/reviewType";

interface ReviewSliderProps {
  reviews: TransformedReview[];
  title?: string | null;
  subtitle?: string | null;
  eyebrow?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string;
}

export default function ReviewSlider({
  reviews,
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  ctaHref = "/reviews",
}: ReviewSliderProps) {
  if (reviews.length === 0) return null;

  const grid = reviews;
  const quotes = reviews.slice(0, 3);

  return (
    <section className="relative py-16 sm:py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-6 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              {eyebrow || subtitle || "Community"}
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.9] tracking-tight sm:text-5xl md:text-6xl">
              {title ? (
                <>
                  {title.replace(/\.$/, "").split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="italic text-primary">
                    {title.replace(/\.$/, "").split(" ").slice(-1)[0]}
                  </span>
                  .
                </>
              ) : (
                <>
                  Worn by the{" "}
                  <span className="italic text-primary">riders</span>.
                </>
              )}
            </h2>
          </div>
          {ctaLabel ? (
            <Link
              href={ctaHref}
              className="inline-flex min-h-11 shrink-0 items-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              {ctaLabel} →
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {grid.map((review) => (
            <div
              key={review.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
            >
              {review.image && (
                <Image
                  src={review.image}
                  alt={review.customerName || "Review"}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/40" />
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {quotes.map((review) => (
            <div
              key={`q-${review.id}`}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
                ))}
              </div>
              <p className="mt-4 text-lg leading-relaxed">
                &ldquo;
                {review.body || "Premium stitch, zero compromises."}
                &rdquo;
              </p>
              <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                — {review.customerName || "VE Crew"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
