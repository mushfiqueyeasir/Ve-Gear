import ProductCard from "@/components/Common/ProductCard";
import NoProductsFound from "./NoProductsFound";
import type { TransformedProduct } from "@/type/productType";

interface ProductGridProps {
  products: TransformedProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <NoProductsFound />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          image={product.image}
          hoverImage={product.hoverImage}
          images={product.images}
          originalPrice={product.originalPrice}
          currentPrice={product.currentPrice}
          discount={product.discount}
          href={product.href}
          stock={product.stock}
        />
      ))}
    </div>
  );
}
