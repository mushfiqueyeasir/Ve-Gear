"use client";

import PromotionModal from "./PromotionModal";
import type { Promotion } from "@/type/promotionType";

interface PromotionModalWrapperProps {
  promotions: Promotion[];
}

export default function PromotionModalWrapper({
  promotions,
}: PromotionModalWrapperProps) {
  const promotion = promotions && promotions.length > 0 ? promotions[0] : null;

  return <PromotionModal promotion={promotion} />;
}
