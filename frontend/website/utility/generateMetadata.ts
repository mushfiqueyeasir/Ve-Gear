import { Metadata } from "next";
import type { SeoItemType } from "@/type/seoType";
import { SeoContent } from "@/SeoContent/SeoContent";
import { appConfig } from "@/lib/config";

export function generateMetadata(seoContent: SeoItemType): Metadata {
  const { title, description, image, siteUrl, keywords, tags } = seoContent;
  const developer = SeoContent.developer;
  const baseUrl = appConfig.siteUrl || siteUrl;
  const imageUrl = new URL(image, baseUrl).href;

  return {
    title,
    description,
    keywords: keywords ? keywords : tags,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      url: siteUrl,
      siteName: "VE Gear",
      type: "website",
    },
    twitter: {
      title,
      description,
      images: [{ url: imageUrl }],
      card: "summary_large_image",
    },
    robots: "index, follow",
    creator: developer.name,
    publisher: developer.name,
    authors: [{ name: developer.name, url: developer.website }],
  };
}
