import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import type { ReviewRow } from "@/type/db";
import { ReviewForm, type ProductOption } from "../ReviewForm";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const [{ data: review }, { data: prods }] = await Promise.all([
    supabase.from("reviews").select("*").eq("id", id).maybeSingle(),
    supabase.from("products").select("id, title").order("title", {
      ascending: true,
    }),
  ]);

  if (!review) notFound();
  const products = (prods ?? []) as ProductOption[];

  return (
    <div>
      <BackLink href="/admin/reviews" label="Back to reviews" />
      <PageHeader
        title="Edit review"
        description={(review as ReviewRow).customer_name ?? undefined}
      />
      <ReviewForm review={review as ReviewRow} products={products} />
    </div>
  );
}
