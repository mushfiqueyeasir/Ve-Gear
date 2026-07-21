import { Suspense } from "react";
import ProductPageScreen from "@/components/ProductPage/ProductPageScreen";
import { ShopPageSkeleton } from "@/components/Common/skeletons/StoreSkeletons";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { SeoContent } from "@/SeoContent/SeoContent";
import { getProducts, transformProduct } from "@/utility/getProducts";
import { getCategories } from "@/utility/getCategory";

export const metadata = generateSeoMetadata(SeoContent.productSeo);
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const transformedProducts = products.map(transformProduct);
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ProductPageScreen
        products={transformedProducts}
        categories={categories}
      />
    </Suspense>
  );
}
