import { requireRole } from "@/lib/admin/auth";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { PromotionForm } from "../PromotionForm";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireRole(["admin", "editor"]);

  return (
    <div>
      <BackLink href="/admin/promotions" label="Back to promotions" />
      <PageHeader
        title="New promotion"
        description="Create a discount campaign or banner."
      />
      <PromotionForm />
    </div>
  );
}
