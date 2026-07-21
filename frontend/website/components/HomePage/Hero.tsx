"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Banner } from "@/utility/getBanners";
import {
  DEFAULT_BANNER_DESCRIPTION,
  DEFAULT_BANNER_STATS,
  type BannerStatItem,
} from "@/type/db";
import { cn } from "@/lib/utils";

interface HeroProps {
  banners: Banner[];
  description?: string | null;
  stats?: BannerStatItem[];
}

const PARTICLES = Array.from({ length: 18 });

export default function Hero({ banners, description, stats }: HeroProps) {
  const [index, setIndex] = useState(0);
  const slides = banners.filter((b) => Boolean(b.title?.trim()));
  const count = slides.length;
  const multiple = count > 1;
  const banner = slides[index];
  const statItems = stats && stats.length > 0 ? stats : DEFAULT_BANNER_STATS;
  const blurb = description?.trim() || DEFAULT_BANNER_DESCRIPTION;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!count) return;
      setIndex((prev) => (prev + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!multiple) return;
    const timer = setInterval(() => {
      setIndex((p) => (p + 1) % count);
    }, 7000);
    return () => clearInterval(timer);
  }, [multiple, count, index]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!banner) return null;

  const title = banner.title!.trim();
  const subtitle = banner.subtitle?.trim() || null;
  const ctaLabel = banner.ctaLabel?.trim() || "Shop collection";
  const ctaUrl = banner.ctaUrl?.trim() || "/product";

  return (
    <section className="relative isolate h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Grid + noise */}
      <div
        className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        aria-hidden
      />

      {/* Spotlight */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vh,640px)] w-[min(70vh,640px)] -translate-x-1/2 -translate-y-1/2 animate-spotlight rounded-full md:h-[900px] md:w-[900px]"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--primary-rgb) / 0.22) 0%, rgb(var(--primary-rgb) / 0.06) 35%, transparent 65%)",
        }}
        aria-hidden
      />

      {/* Hero image — right column; overlaps left so the panel edge never shows as a seam */}
      <div className="absolute inset-y-0 right-0 w-full overflow-hidden md:left-[36%] md:w-auto">
        <div className="relative h-full w-full">
          {slides.map((slide, i) => {
            const src = slide.imageUrl ?? slide.mobileImageUrl;
            if (!src) return null;
            const active = i === index;
            return (
              <div
                key={slide.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active ? "z-[1] opacity-100" : "z-0 opacity-0",
                )}
                aria-hidden={!active}
              >
                <Image
                  src={src}
                  alt={slide.title?.trim() || "Banner slide"}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 64vw"
                  className={cn(
                    "object-cover object-center opacity-70 transition-transform duration-[7000ms] ease-out will-change-transform md:opacity-100",
                    active ? "scale-105" : "scale-[1.02]",
                  )}
                />
              </div>
            );
          })}
          {/* Wide soft fade — hard edge of the column sits under solid background */}
          <div
            className="absolute inset-0 z-[2]"
            style={{
              background:
                "linear-gradient(90deg, var(--background) 0%, color-mix(in srgb, var(--background) 92%, transparent) 18%, color-mix(in srgb, var(--background) 55%, transparent) 38%, color-mix(in srgb, var(--background) 18%, transparent) 58%, transparent 78%)",
            }}
          />
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden>
        {PARTICLES.map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 h-1 w-1 animate-particle rounded-full bg-primary/60"
            style={{
              left: `${(i * 5.7) % 100}%`,
              animationDuration: `${8 + (i % 6) * 2}s`,
              animationDelay: `${-i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-6 pb-6 pt-24 md:px-10 md:pb-8 md:pt-28">
        <div key={banner.id} className="max-w-3xl">
          {subtitle ? (
            <div
              className="mb-4 inline-flex animate-hero-in items-center gap-3 rounded-full border border-border bg-surface/60 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-md md:mb-6 md:px-4 md:py-1.5 md:text-[11px]"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {subtitle}
            </div>
          ) : null}

          <h1
            className="animate-hero-in font-display text-[clamp(2.6rem,7.5vw,5.75rem)] font-bold leading-[0.88] tracking-[-0.045em] text-foreground md:text-[clamp(3rem,8vw,6.5rem)]"
            style={{ animationDelay: "0.12s" }}
          >
            {renderTitle(title)}
          </h1>

          {blurb ? (
            <p
              className="mt-4 max-w-md animate-hero-in text-sm leading-relaxed text-muted-foreground md:mt-6 md:text-base"
              style={{ animationDelay: "0.22s" }}
            >
              {blurb}
            </p>
          ) : null}

          <div
            className="mt-5 flex animate-hero-in flex-wrap items-center gap-2.5 md:mt-8 md:gap-3"
            style={{ animationDelay: "0.32s" }}
          >
            <Link
              href={ctaUrl}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-foreground px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-background transition-all hover:pl-7 hover:pr-5 md:px-8 md:py-3.5 md:text-[13px]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/product"
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-transparent px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground transition hover:border-primary hover:text-primary md:px-8 md:py-3.5 md:text-[13px]"
            >
              Explore New Drop
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div
          className="mt-4 flex shrink-0 animate-float-up items-end justify-between border-t border-border/80 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:mt-6 md:pt-5 md:text-[11px]"
          style={{ animationDelay: "0.45s" }}
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 md:grid-cols-4 md:gap-x-10">
            {statItems.map((s) => (
              <Stat key={`${s.label}-${s.value}`} k={s.label} v={s.value} />
            ))}
          </div>
          {multiple ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="tabular-nums text-foreground/80">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="rounded-full border border-border p-2 transition hover:border-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="rounded-full border border-border p-2 transition hover:border-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <span>Scroll</span>
              <span className="block h-6 w-px bg-border" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function renderTitle(title: string) {
  const parts = title.split(/(RIDE)/gi);
  if (parts.length === 1) {
    return title.split(/\n/).map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {line}
      </span>
    ));
  }
  return parts.map((part, i) =>
    /^ride$/i.test(part) ? (
      <span key={i} className="text-glow-coral text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>
        {part.split(/(\. )/).map((chunk, j) =>
          chunk === ". " ? (
            <span key={j}>
              .<br />
            </span>
          ) : (
            <span key={j}>{chunk}</span>
          ),
        )}
      </span>
    ),
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground/60">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}
