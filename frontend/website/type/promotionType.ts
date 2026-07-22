// Frontend-facing promotion type. imageUrl is a resolved Supabase Storage URL.

export interface Promotion {
  _id: string;
  title: string;
  description?: string | null;
  imageUrl: string | null;
  discountPercent?: number | null;
  /** Where Shop Now goes — e.g. `/product/shadow-drop-tee` */
  ctaUrl?: string | null;
  ctaLabel?: string | null;
}
