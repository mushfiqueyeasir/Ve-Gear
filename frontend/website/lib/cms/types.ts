export type CmsPageSlug = "about" | "terms" | "privacy" | "refund";

export interface CmsPage {
  slug: CmsPageSlug;
  title: string;
  body_html: string;
  updated_at: string;
}

export interface CmsAnnouncement {
  text: string | null;
  active: boolean;
  url: string | null;
}

export interface CmsSeo {
  title: string;
  description: string;
  keywords: string;
  og_image_path: string | null;
}

export const DEFAULT_SEO: CmsSeo = {
  title: "VE Gear – Premium Gear & Essentials",
  description:
    "Shop premium gear and everyday essentials at VE Gear. Thoughtfully designed, high-quality pieces built to move with you.",
  keywords:
    "VE Gear, Premium Gear, Streetwear, Oversized Tee, Rider Essentials, Online Store",
  og_image_path: null,
};

export type { CurrencyCode, CurrencySettings } from "@/lib/currency";
export {
  DEFAULT_CURRENCY_SETTINGS,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency";

export type { DeliveryCharges } from "@/lib/delivery";
export { DEFAULT_DELIVERY_CHARGES } from "@/lib/delivery";

export type { ChatWidgets } from "@/lib/chatWidgets";
export { DEFAULT_CHAT_WIDGETS } from "@/lib/chatWidgets";
