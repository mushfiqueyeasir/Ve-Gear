import { DEFAULT_BANNER_MARQUEE } from "@/type/db";

export default function Marquee({
  items = DEFAULT_BANNER_MARQUEE,
}: {
  items?: string[];
}) {
  const list = items.length ? items : DEFAULT_BANNER_MARQUEE;
  // Two copies — CSS animates translateX(-50%) for a seamless loop.
  const row = [...list, ...list];

  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/40 py-3 md:py-6">
      <div className="flex animate-marquee whitespace-nowrap">
        {row.map((t, i) => (
          <div
            key={`${t}-${i}`}
            className="flex shrink-0 items-center gap-4 px-4 md:gap-8 md:px-8"
          >
            <span className="font-display text-lg font-bold tracking-tight text-foreground/90 sm:text-2xl md:text-4xl">
              {t}
            </span>
            <svg
              viewBox="0 0 24 24"
              className="size-3.5 shrink-0 fill-primary md:size-5"
              aria-hidden
            >
              <path d="M12 2l2.09 6.26L20 9.27l-4.5 4.39L16.18 20 12 16.9 7.82 20l1.68-6.34L5 9.27l5.91-1.01L12 2z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
