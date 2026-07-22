import type { Metadata } from "next";
import ProductPageScreen from "@/components/ProductPage/ProductPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";
import { getProducts, transformProduct } from "@/utility/getProducts";
import { getCategories } from "@/utility/getCategory";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("product"));
}

type ProductSearchParams = {
  category?: string | string[];
  search?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchParams>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const transformedProducts = products.map(transformProduct);

  return (
    <ProductPageScreen
      products={transformedProducts}
      categories={categories}
      initialCategory={firstParam(params.category)?.trim() || undefined}
      initialSearch={firstParam(params.search) ?? undefined}
    />
  );
}
