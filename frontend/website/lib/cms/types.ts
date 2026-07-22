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

export type SeoPageKey =
  | "home"
  | "about"
  | "product"
  | "contact"
  | "reviews"
  | "cart"
  | "wishlist"
  | "checkout"
  | "track"
  | "privacy"
  | "terms"
  | "refund";

export const SEO_PAGE_KEYS: SeoPageKey[] = [
  "home",
  "about",
  "product",
  "contact",
  "reviews",
  "cart",
  "wishlist",
  "checkout",
  "track",
  "privacy",
  "terms",
  "refund",
];

export const SEO_PAGE_META: Record<
  SeoPageKey,
  { label: string; path: string }
> = {
  home: { label: "Home", path: "/" },
  about: { label: "About Us", path: "/about-us" },
  product: { label: "Shop", path: "/product" },
  contact: { label: "Contact Us", path: "/contact-us" },
  reviews: { label: "Reviews", path: "/reviews" },
  cart: { label: "Cart", path: "/cart" },
  wishlist: { label: "Favorites", path: "/wishlist" },
  checkout: { label: "Checkout", path: "/checkout" },
  track: { label: "Track Order", path: "/track-order" },
  privacy: { label: "Privacy Policy", path: "/privacy-policy" },
  terms: { label: "Terms of Service", path: "/terms-of-service" },
  refund: { label: "Refund Policy", path: "/refund-policy" },
};

export const DEFAULT_SEO: CmsSeo = {
  title: "VE Gear – Premium Gear & Essentials",
  description:
    "Shop premium gear and everyday essentials at VE Gear. Thoughtfully designed, high-quality pieces built to move with you.",
  keywords:
    "VE Gear, Premium Gear, Streetwear, Oversized Tee, Rider Essentials, Online Store",
  og_image_path: null,
};

export const DEFAULT_PAGES_SEO: Record<SeoPageKey, CmsSeo> = {
  home: { ...DEFAULT_SEO },
  about: {
    title: "About Us | VE Gear",
    description:
      "Learn about VE Gear — modern design meets everyday performance. Premium, dependable essentials with quality materials.",
    keywords: "VE Gear, About VE Gear, Brand Story, Quality Gear",
    og_image_path: null,
  },
  product: {
    title: "Shop | VE Gear",
    description:
      "Explore the VE Gear collection of premium gear and essentials. Shop the latest drops, featured pieces, and best sellers.",
    keywords: "VE Gear, Shop, Collections, Best Sellers, Online Store",
    og_image_path: null,
  },
  contact: {
    title: "Contact Us | VE Gear",
    description:
      "Get in touch with VE Gear for customer support, inquiries, or feedback.",
    keywords: "VE Gear, Contact, Customer Support",
    og_image_path: null,
  },
  reviews: {
    title: "Customer Reviews | VE Gear",
    description:
      "Read authentic customer reviews and see real photos from the VE Gear community.",
    keywords: "VE Gear, Customer Reviews, Testimonials",
    og_image_path: null,
  },
  cart: {
    title: "Shopping Cart | VE Gear",
    description: "Review your selected items in your VE Gear shopping cart.",
    keywords: "VE Gear, Shopping Cart",
    og_image_path: null,
  },
  wishlist: {
    title: "Favorites | VE Gear",
    description:
      "Your saved VE Gear favorites — kept on this device so you can come back anytime.",
    keywords: "VE Gear, Favorites, Wishlist",
    og_image_path: null,
  },
  checkout: {
    title: "Checkout | VE Gear",
    description:
      "Complete your purchase at VE Gear with a fast, secure checkout.",
    keywords: "VE Gear, Checkout, Secure Checkout",
    og_image_path: null,
  },
  track: {
    title: "Track Order | VE Gear",
    description:
      "Track your VE Gear order status by entering your order number.",
    keywords: "VE Gear, Track Order, Order Status, Order Tracking",
    og_image_path: null,
  },
  privacy: {
    title: "Privacy Policy | VE Gear",
    description:
      "Read the VE Gear privacy policy to understand how we collect, use, and protect your personal information.",
    keywords: "VE Gear, Privacy Policy, Data Protection",
    og_image_path: null,
  },
  terms: {
    title: "Terms and Conditions | VE Gear",
    description:
      "Read the VE Gear terms and conditions covering accounts, products, pricing, shipping, and returns.",
    keywords: "VE Gear, Terms of Service, Terms and Conditions",
    og_image_path: null,
  },
  refund: {
    title: "Shipping & Return Policy | VE Gear",
    description:
      "Learn about VE Gear shipping and return policy, delivery times, and order tracking.",
    keywords: "VE Gear, Shipping Policy, Return Policy, Refund Policy",
    og_image_path: null,
  },
};

export function normalizePagesSeo(
  raw: unknown,
  homeSeo?: Partial<CmsSeo> | null,
): Record<SeoPageKey, CmsSeo> {
  const source =
    raw && typeof raw === "object"
      ? (raw as Partial<Record<SeoPageKey, Partial<CmsSeo>>>)
      : {};

  const pages = {} as Record<SeoPageKey, CmsSeo>;
  for (const key of SEO_PAGE_KEYS) {
    const defaults =
      key === "home"
        ? { ...DEFAULT_SEO, ...(homeSeo ?? {}) }
        : DEFAULT_PAGES_SEO[key];
    pages[key] = {
      ...defaults,
      ...(source[key] ?? {}),
    };
  }

  // Keep legacy top-level `seo` in sync with home when pages_seo.home is empty.
  if (!source.home && homeSeo) {
    pages.home = { ...DEFAULT_SEO, ...homeSeo };
  }

  return pages;
}

export type { CurrencyCode, CurrencySettings } from "@/lib/currency";
export {
  DEFAULT_CURRENCY_SETTINGS,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency";

export type { DeliveryCharges } from "@/lib/delivery";
export { DEFAULT_DELIVERY_CHARGES } from "@/lib/delivery";

export type { ChatWidgets } from "@/lib/chatWidgets";
export { DEFAULT_CHAT_WIDGETS } from "@/lib/chatWidgets";
