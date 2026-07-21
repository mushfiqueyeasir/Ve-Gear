import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/utility/imageUrl";
import { normalizeSizeChart } from "@/lib/products/sizeChart";
import type {
  Product,
  CategoryWithProducts,
  TransformedProduct,
  ProductStock,
  ProductCategory,
} from "@/type/productType";

// Shape returned by the nested Supabase select below.
interface RawProduct {
  id: string;
  title: string;
  slug: string;
  original_price: number;
  current_price: number;
  description: { html?: string } | null;
  size_chart?: unknown;
  product_images: {
    path: string;
    alt: string | null;
    is_main: boolean;
    sort: number;
  }[];
  product_variants: { size: string | null; stock_quantity: number }[];
  product_categories: {
    categories: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    } | null;
  }[];
}

const PRODUCT_SELECT = `
  id, title, slug, original_price, current_price, description, size_chart,
  product_images ( path, alt, is_main, sort ),
  product_variants ( size, stock_quantity ),
  product_categories ( categories ( id, name, slug, description ) )
`;

const PRODUCT_SELECT_LEGACY = `
  id, title, slug, original_price, current_price, description,
  product_images ( path, alt, is_main, sort ),
  product_variants ( size, stock_quantity ),
  product_categories ( categories ( id, name, slug, description ) )
`;

function aggregateStock(
  variants: { size: string | null; stock_quantity: number }[],
): ProductStock[] {
  const bySize = new Map<string, number>();
  for (const v of variants) {
    const size = v.size ?? "One Size";
    bySize.set(size, (bySize.get(size) ?? 0) + (v.stock_quantity ?? 0));
  }
  return Array.from(bySize.entries()).map(([size, quantity]) => ({
    size,
    quantity,
  }));
}

function mapCategories(
  rows: RawProduct["product_categories"],
): ProductCategory[] {
  return rows
    .map((r) => r.categories)
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      _id: c.id,
      categoryName: c.name,
      categoryDescription: c.description,
      categoryUrl: { current: c.slug },
    }));
}

function mapProduct(raw: RawProduct): Product {
  const images = [...raw.product_images].sort((a, b) => a.sort - b.sort);
  const main = images.find((i) => i.is_main) ?? images[0];
  const gallery = images
    .filter((i) => i !== main)
    .map((i) => productImageUrl(i.path))
    .filter((u): u is string => Boolean(u));

  return {
    _id: raw.id,
    title: raw.title,
    slug: { current: raw.slug },
    categories: mapCategories(raw.product_categories),
    image: productImageUrl(main?.path) ?? "",
    images: gallery,
    originalPrice: Number(raw.original_price),
    currentPrice: Number(raw.current_price),
    description: raw.description,
    sizeChart: normalizeSizeChart(raw.size_chart),
    stock: aggregateStock(raw.product_variants),
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const ordered = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: false });

  if (!ordered.error) {
    return ((ordered.data as unknown as RawProduct[]) ?? []).map(mapProduct);
  }

  // Fallback before size_chart / sort migrations.
  const legacySelect = /size_chart/i.test(ordered.error.message)
    ? PRODUCT_SELECT_LEGACY
    : PRODUCT_SELECT;

  const { data, error } = await supabase
    .from("products")
    .select(legacySelect)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as unknown as RawProduct[]) ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error && /size_chart/i.test(error.message)) {
    ({ data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_LEGACY)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle());
  }

  if (error) throw error;
  if (!data) return null;
  return mapProduct(data as unknown as RawProduct);
}

export function groupProductsByCategory(
  products: Product[],
): CategoryWithProducts[] {
  const categoryMap = new Map<string, CategoryWithProducts>();

  products.forEach((product) => {
    const category = product.categories[0];
    if (!category) return;

    const categoryId = category.categoryUrl.current;
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName: category.categoryName,
        categorySubtitle: category.categoryDescription || null,
        categoryHref: `/product?category=${categoryId}`,
        products: [],
      });
    }
    categoryMap.get(categoryId)!.products.push(product);
  });

  return Array.from(categoryMap.values());
}

export function transformProduct(product: Product): TransformedProduct {
  const mainImageUrl = product.image || "";
  const hoverImageUrl =
    product.images.length > 0 ? product.images[0] : undefined;
  const galleryImages = product.images.length > 0 ? product.images : undefined;

  const discount =
    product.originalPrice > product.currentPrice
      ? Math.round(
          ((product.originalPrice - product.currentPrice) /
            product.originalPrice) *
            100,
        )
      : undefined;

  return {
    id: product._id,
    title: product.title,
    image: mainImageUrl,
    hoverImage: hoverImageUrl,
    images: galleryImages,
    originalPrice: product.originalPrice,
    currentPrice: product.currentPrice,
    discount,
    href: `/product/${product.slug.current}`,
    slug: product.slug.current,
    stock: product.stock,
    sizeChart: product.sizeChart ?? [],
    categories: product.categories,
  };
}
