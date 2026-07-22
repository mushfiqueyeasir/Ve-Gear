import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import type { PromotionRow } from "@/type/db";
import { PromotionForm, type ProductOption } from "../PromotionForm";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const [{ data }, productsRes] = await Promise.all([
    supabase.from("promotions").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("products")
      .select("id, title, slug")
      .eq("status", "active")
      .order("title", { ascending: true }),
  ]);

  if (!data) notFound();
  const promotion = data as PromotionRow;
  const products = (productsRes.data ?? []) as ProductOption[];

  return (
    <div>
      <BackLink href="/admin/promotions" label="Back to promotions" />
      <PageHeader title="Edit promotion" description={promotion.title} />
      <PromotionForm promotion={promotion} products={products} />
    </div>
  );
}
