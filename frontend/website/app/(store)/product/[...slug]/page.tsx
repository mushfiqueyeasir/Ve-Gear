import ProductDetailPageScreen from "@/components/ProductDetailPage/ProductDetailPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getProductBySlug, transformProduct } from "@/utility/getProducts";
import { notFound } from "next/navigation";

export const metadata = generateSeoMetadata(SeoContent.productSeo);
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string[] } | Promise<{ slug: string[] }>;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slugArray = resolvedParams.slug || [];
  const slug = slugArray.length > 0 ? slugArray.join("/") : "";

  if (!slug) {
    notFound();
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const transformedProduct = transformProduct(product);

  return (
    <ProductDetailPageScreen
      product={transformedProduct}
      description={product.description}
      stock={product.stock}
    />
  );
}
