"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TransformedProduct } from "@/type/productType";
import ImageLoader from "@/components/Common/ImageLoader";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  product: TransformedProduct;
}

export default function ProductImageGallery({
  product,
}: ProductImageGalleryProps) {
  const images = useMemo(() => {
    const list: string[] = [];
    const push = (url?: string | null) => {
      if (url && !list.includes(url)) list.push(url);
    };
    push(product.image);
    push(product.hoverImage);
    product.images?.forEach(push);
    return list;
  }, [product.image, product.hoverImage, product.images]);

  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setSelectedImage(images[0] ?? "");
  }, [images]);

  const checkScrollPosition = () => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1,
    );
  };

  useEffect(() => {
    checkScrollPosition();
    const container = thumbnailContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [images.length]);

  const scrollThumbnails = (direction: "left" | "right") => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl border border-border bg-card" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <ImageLoader
          src={selectedImage}
          alt={product.title}
          width={1000}
          height={1200}
          className="aspect-[4/5] w-full object-cover"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md">
            {images.indexOf(selectedImage) + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollThumbnails("left")}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-md transition hover:border-primary",
              !canScrollLeft && "pointer-events-none opacity-40",
            )}
            aria-label="Previous thumbnails"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollThumbnails("right")}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-0 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-md transition hover:border-primary",
              !canScrollRight && "pointer-events-none opacity-40",
            )}
            aria-label="Next thumbnails"
          >
            <ChevronRight className="size-4" />
          </button>

          <div
            ref={thumbnailContainerRef}
            className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth px-10"
          >
            {images.map((img, index) => (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={cn(
                  "relative aspect-square w-[30%] min-w-[96px] max-w-[140px] flex-shrink-0 overflow-hidden rounded-xl border-2 transition",
                  selectedImage === img
                    ? "border-primary"
                    : "border-transparent hover:border-border",
                )}
              >
                <ImageLoader
                  src={img}
                  alt={`${product.title} view ${index + 1}`}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
