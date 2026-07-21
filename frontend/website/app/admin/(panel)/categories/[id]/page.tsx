import { notFound } from "next/navigation";
import { requireRole } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import type { CategoryRow } from "@/type/db";
import { CategoryForm } from "../CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const category = data as CategoryRow;

  return (
    <div>
      <BackLink href="/admin/categories" label="Back to categories" />
      <PageHeader title="Edit category" description={category.name} />
      <CategoryForm category={category} />
    </div>
  );
}
