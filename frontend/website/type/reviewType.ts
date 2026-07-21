// Frontend-facing review types. image is a resolved Supabase Storage URL.

export interface Review {
  _id: string;
  imageUrl: string | null;
  customerName?: string | null;
  rating?: number | null;
  body?: string | null;
}

export interface TransformedReview {
  id: string;
  image: string;
  customerName?: string | null;
  body?: string | null;
  rating?: number | null;
}
