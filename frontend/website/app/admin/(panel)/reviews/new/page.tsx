import { requireRole } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { ReviewForm, type ProductOption } from "../ReviewForm";

export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
  await requireRole(["admin", "editor"]);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, title")
    .order("title", { ascending: true });
  const products = (data ?? []) as ProductOption[];

  return (
    <div>
      <BackLink href="/admin/reviews" label="Back to reviews" />
      <PageHeader
        title="New review"
        description="Add a customer testimonial."
      />
      <ReviewForm products={products} />
    </div>
  );
}
