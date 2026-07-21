"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ImageLoaderProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
}

export default function ImageLoader({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  onLoad,
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && !hasError && (
        <Skeleton className="absolute inset-0 z-10 rounded-none" />
      )}
      {hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Skeleton className="size-10 rounded-full opacity-40" />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
          )}
          priority={priority}
          sizes={sizes}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadingComplete={handleImageLoad}
        />
      )}
    </div>
  );
}
