"use client";

import { useEffect } from "react";
import type { TransformedProduct, ProductStock } from "@/type/productType";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import SizeChart from "./SizeChart";
import { trackViewContent } from "@/utility/analytics/facebookPixelEvents";

interface ProductDetailPageScreenProps {
  product: TransformedProduct;
  description?: { html?: string } | null;
  stock?: ProductStock[];
}

export default function ProductDetailPageScreen({
  product,
  description,
  stock,
}: ProductDetailPageScreenProps) {
  useEffect(() => {
    trackViewContent(product.id, product.currentPrice, "USD");
  }, [product.id, product.currentPrice]);

  const hasSizeChart = (product.sizeChart?.length ?? 0) > 0;

  return (
    <section className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImageGallery product={product} />
        <ProductInfo product={product} stock={stock} />
      </div>

      <div className="mx-auto max-w-3xl space-y-12">
        {description?.html && <ProductDescription description={description} />}
        {hasSizeChart && <SizeChart sizeChart={product.sizeChart} />}
      </div>
    </section>
  );
}
