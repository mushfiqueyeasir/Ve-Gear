import Link from "next/link";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/admin/Icon";
import type { ReviewRow } from "@/type/db";
import { ReviewsTable, type ReviewWithProduct } from "./ReviewsTable";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as ReviewRow[];

  // Resolve product titles for the referenced products.
  const productIds = [
    ...new Set(reviews.map((r) => r.product_id).filter((v): v is string => !!v)),
  ];
  const titleMap = new Map<string, string>();
  if (productIds.length) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, title")
      .in("id", productIds);
    for (const p of (prods ?? []) as { id: string; title: string }[]) {
      titleMap.set(p.id, p.title);
    }
  }

  const rows: ReviewWithProduct[] = reviews.map((r) => ({
    ...r,
    productTitle: r.product_id ? titleMap.get(r.product_id) ?? null : null,
  }));

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Customer testimonials shown across your storefront."
      >
        {writable && (
          <Button asChild className="rounded-full">
            <Link href="/admin/reviews/new">
              <Icon name="Plus" className="mr-2 size-4" />
              New review
            </Link>
          </Button>
        )}
      </PageHeader>

      <ReviewsTable data={rows} canWrite={writable} />
    </div>
  );
}
