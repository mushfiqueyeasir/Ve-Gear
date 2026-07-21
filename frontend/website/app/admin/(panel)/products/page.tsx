import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/utility/getSettings";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { productImageUrl } from "@/utility/imageUrl";
import { ProductsTable, type ProductTableRow } from "./ProductsTable";

export const dynamic = "force-dynamic";

interface ProductQueryRow {
  id: string;
  title: string;
  slug: string;
  status: "active" | "draft" | "archived";
  current_price: number;
  sort: number | null;
  product_images: { path: string; is_main: boolean; sort: number }[];
  product_variants: { stock_quantity: number }[];
  product_categories: { categories: { id: string; name: string } | null }[];
}

export default async function ProductsPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);
  const supabase = await createSupabaseServerClient();

  const selectWithSort = `id, title, slug, status, current_price, sort,
         product_images ( path, is_main, sort ),
         product_variants ( stock_quantity ),
         product_categories ( categories ( id, name ) )`;
  const selectFallback = `id, title, slug, status, current_price,
         product_images ( path, is_main, sort ),
         product_variants ( stock_quantity ),
         product_categories ( categories ( id, name ) )`;

  const [productRes, settings] = await Promise.all([
    supabase
      .from("products")
      .select(selectWithSort)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false }),
    getSiteSettings(),
  ]);

  let rawRows: unknown[] = (productRes.data as unknown[]) ?? [];
  if (productRes.error) {
    const fallback = await supabase
      .from("products")
      .select(selectFallback)
      .order("created_at", { ascending: false });
    rawRows = (fallback.data as unknown[]) ?? [];
  }

  const symbol = settings.currency_symbol || "$";

  const rows: ProductTableRow[] = (rawRows as ProductQueryRow[]).map((p) => {
    const images = [...(p.product_images ?? [])].sort(
      (a, b) => a.sort - b.sort,
    );
    const main = images.find((img) => img.is_main) ?? images[0];
    const totalStock = (p.product_variants ?? []).reduce(
      (sum, v) => sum + (v.stock_quantity ?? 0),
      0,
    );
    const categories = (p.product_categories ?? [])
      .map((pc) => pc.categories?.name)
      .filter((n): n is string => Boolean(n));

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      current_price: p.current_price,
      mainImage: productImageUrl(main?.path),
      totalStock,
      categories,
      sort: p.sort ?? 0,
    };
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, imagery and variants."
      >
        {writable && (
          <Button asChild className="rounded-full">
            <Link href="/admin/products/new">
              <Plus className="size-4" /> New product
            </Link>
          </Button>
        )}
      </PageHeader>

      <ProductsTable data={rows} symbol={symbol} canWrite={writable} />
    </div>
  );
}
