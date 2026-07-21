import Link from "next/link";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/admin/Icon";
import type { PromotionRow } from "@/type/db";
import { PromotionsTable } from "./PromotionsTable";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as PromotionRow[];

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Banners and discount campaigns shown on your storefront."
      >
        {writable && (
          <Button asChild className="rounded-full">
            <Link href="/admin/promotions/new">
              <Icon name="Plus" className="mr-2 size-4" />
              New promotion
            </Link>
          </Button>
        )}
      </PageHeader>

      <PromotionsTable data={rows} canWrite={writable} />
    </div>
  );
}
