import type { Metadata } from "next";
import type { Product } from "@/type/productType";
import { appConfig } from "@/lib/config";
import { SeoContent } from "@/SeoContent/SeoContent";

const FALLBACK_IMAGE = "/images/seoThumbnail/home.png";
const SITE_NAME = "VE Gear";

export function htmlToPlainText(
  description: { html?: string } | null | undefined,
): string {
  if (!description?.html) return "";
  return description.html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

function absoluteUrl(pathOrUrl: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl || FALLBACK_IMAGE, baseUrl).href;
}

export function getProductCanonicalUrl(slug: string): string {
  const baseUrl = appConfig.siteUrl || "";
  return `${baseUrl.replace(/\/$/, "")}/product/${slug}`;
}

export function buildProductMetadata(product: Product): Metadata {
  const baseUrl = appConfig.siteUrl || "";
  const slug = product.slug.current;
  const url = getProductCanonicalUrl(slug);
  const title = `${product.title} | ${SITE_NAME}`;
  const plain = htmlToPlainText(product.description);
  const description =
    truncate(plain) ||
    `Shop ${product.title} at ${SITE_NAME}. Premium gear and essentials.`;
  const imageUrl = absoluteUrl(product.image || FALLBACK_IMAGE, baseUrl);
  const categoryNames = product.categories.map((c) => c.categoryName);
  const developer = SeoContent.developer;

  return {
    title,
    description,
    keywords: [
      product.title,
      SITE_NAME,
      ...categoryNames,
      "Shop",
      "Buy Online",
    ],
    metadataBase: new URL(baseUrl || "https://www.vegear.com"),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: product.title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [{ url: imageUrl, alt: product.title }],
      card: "summary_large_image",
    },
    robots: "index, follow",
    creator: developer.name,
    publisher: developer.name,
    authors: [{ name: developer.name, url: developer.website }],
  };
}

export function buildProductJsonLd(
  product: Product,
  currency = "BDT",
): Record<string, unknown> {
  const url = getProductCanonicalUrl(product.slug.current);
  const baseUrl = appConfig.siteUrl || "";
  const imageUrl = absoluteUrl(product.image || FALLBACK_IMAGE, baseUrl);
  const gallery = [
    imageUrl,
    ...product.images.map((img) => absoluteUrl(img, baseUrl)),
  ];
  const uniqueImages = Array.from(new Set(gallery.filter(Boolean)));
  const description =
    htmlToPlainText(product.description) ||
    `Shop ${product.title} at ${SITE_NAME}.`;
  const inStock = product.stock.some((item) => item.quantity > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image: uniqueImages,
    sku: product._id,
    url,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(product.categories[0]
      ? { category: product.categories[0].categoryName }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: product.currentPrice.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}
