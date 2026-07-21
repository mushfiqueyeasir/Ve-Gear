import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reviewImageUrl } from "@/utility/imageUrl";
import type { Review, TransformedReview } from "@/type/reviewType";
import type { ReviewRow } from "@/type/db";

function mapReview(row: ReviewRow): Review {
  return {
    _id: row.id,
    imageUrl: reviewImageUrl(row.image_path),
    customerName: row.customer_name,
    rating: row.rating,
    body: row.body,
  };
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as ReviewRow[]) ?? []).map(mapReview);
}

export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapReview(data as ReviewRow) : null;
}

export function transformReview(review: Review): TransformedReview {
  return {
    id: review._id,
    image: review.imageUrl || "",
    customerName: review.customerName || null,
    body: review.body || null,
    rating: review.rating ?? null,
  };
}
