import { requireRole } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { PromotionForm, type ProductOption } from "../PromotionForm";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireRole(["admin", "editor"]);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, slug")
    .eq("status", "active")
    .order("title", { ascending: true });
  const products = (data ?? []) as ProductOption[];

  return (
    <div>
      <BackLink href="/admin/promotions" label="Back to promotions" />
      <PageHeader
        title="New promotion"
        description="Create a promotional offer for the storefront."
      />
      <PromotionForm products={products} />
    </div>
  );
}
