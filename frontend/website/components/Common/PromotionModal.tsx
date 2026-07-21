"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { Promotion } from "@/type/promotionType";

interface PromotionModalProps {
  promotion: Promotion | null;
}

export default function PromotionModal({ promotion }: PromotionModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleShopNow = () => {
    handleClose();
    router.push("/product");
  };

  if (!promotion) {
    return null;
  }

  const imageUrl = promotion.imageUrl;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[min(88dvh,820px)] w-[calc(100%-1.5rem)] max-w-xl gap-0 overflow-hidden rounded-2xl border-0 bg-[#111] p-0 shadow-2xl shadow-black/60 sm:w-[calc(100%-2rem)] sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">
          {promotion.title} -{" "}
          {promotion.discountPercent
            ? `${promotion.discountPercent}% OFF`
            : "Special Offer"}
        </DialogTitle>

        <div className="relative flex max-h-[min(88dvh,820px)] flex-col">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {imageUrl && (
            <div className="relative h-[min(48dvh,380px)] w-full shrink-0 bg-black sm:h-[min(52dvh,420px)]">
              <Image
                src={imageUrl}
                alt={promotion.title}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#111] to-transparent" />
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-4 bg-[#111] px-6 pb-6 pt-5 sm:gap-5 sm:px-8 sm:pb-8 sm:pt-6">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                Limited offer
              </p>
              <h2 className="font-display text-3xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-4xl">
                {promotion.title}
              </h2>
              {promotion.discountPercent ? (
                <p className="mt-2 text-xl font-semibold sm:text-2xl">
                  Up to{" "}
                  <span className="text-primary">
                    {promotion.discountPercent}% OFF
                  </span>
                </p>
              ) : null}
            </div>
            {promotion.description ? (
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {promotion.description}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleShopNow}
              className="mt-auto w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
            >
              Shop Now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
