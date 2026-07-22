import { createSupabaseServerClient } from "@/lib/supabase/server";
import { promotionImageUrl } from "@/utility/imageUrl";
import type { Promotion } from "@/type/promotionType";
import type { PromotionRow } from "@/type/db";

function mapPromotion(row: PromotionRow): Promotion {
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: promotionImageUrl(row.image_path),
    discountPercent: row.discount_percent,
    ctaUrl: row.cta_url?.trim() || null,
    ctaLabel: row.cta_label?.trim() || null,
  };
}

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as PromotionRow[]) ?? []).map(mapPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPromotion(data as PromotionRow) : null;
}

export async function getLatestPromotion(): Promise<Promotion | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPromotion(data as PromotionRow) : null;
}
