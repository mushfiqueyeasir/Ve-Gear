import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import type { PromotionRow } from "@/type/db";
import { PromotionForm } from "../PromotionForm";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const promotion = data as PromotionRow;

  return (
    <div>
      <BackLink href="/admin/promotions" label="Back to promotions" />
      <PageHeader
        title="Edit promotion"
        description={promotion.title}
      />
      <PromotionForm promotion={promotion} />
    </div>
  );
}
