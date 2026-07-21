// Frontend-facing product types. Field names are preserved from the original
// storefront so page/components need no changes; data now comes from Supabase.

export interface ProductStock {
  size: string;
  quantity: number;
}

export interface ProductSizeChartRow {
  size: string;
  chest: string;
  length: string;
}

export interface ProductCategory {
  _id: string;
  categoryName: string;
  categoryDescription?: string | null;
  categoryUrl: {
    current: string;
  };
}

export interface Product {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  categories: ProductCategory[];
  image: string; // main image URL (resolved)
  images: string[]; // gallery image URLs (resolved)
  originalPrice: number;
  currentPrice: number;
  description: { html?: string } | null;
  sizeChart: ProductSizeChartRow[];
  stock: ProductStock[];
}

export interface CategoryWithProducts {
  categoryId: string;
  categoryName: string;
  categorySubtitle?: string | null;
  categoryHref: string;
  products: Product[];
}

export interface TransformedProduct {
  id: string;
  title: string;
  image: string;
  hoverImage?: string;
  images?: string[];
  originalPrice: number;
  currentPrice: number;
  discount?: number;
  href: string;
  slug: string;
  stock: ProductStock[];
  sizeChart: ProductSizeChartRow[];
  categories: ProductCategory[];
}
