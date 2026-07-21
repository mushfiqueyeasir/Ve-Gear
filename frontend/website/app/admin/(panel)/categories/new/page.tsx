import { requireRole } from "@/lib/admin/auth";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { CategoryForm } from "../CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireRole(["admin", "editor"]);

  return (
    <div>
      <BackLink href="/admin/categories" label="Back to categories" />
      <PageHeader
        title="New category"
        description="Create a collection to group products."
      />
      <CategoryForm />
    </div>
  );
}
