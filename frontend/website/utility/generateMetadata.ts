import { Metadata } from "next";
import type { SeoItemType } from "@/type/seoType";
import { SeoContent } from "@/SeoContent/SeoContent";
import { appConfig } from "@/lib/config";

export function generateMetadata(seoContent: SeoItemType) {
  const { title, description, image, siteUrl, keywords, tags } = seoContent;
  const developer = SeoContent.developer;

  const metadata: Metadata = {
    title: title,
    description: description,
    keywords: keywords ? keywords : tags,
    openGraph: {
      title: title,
      description: description,
      images: [{ url: new URL(image, appConfig.siteUrl).href }],
      url: siteUrl,
      type: "website",
    },
    twitter: {
      title: title,
      description: description,
      images: [{ url: new URL(image, appConfig.siteUrl).href }],
      card: "summary_large_image",
    },
    robots: "index, follow",
    creator: developer.name,
    publisher: developer.name,
    authors: [{ name: developer.name, url: developer.website }],
    metadataBase: new URL(developer.website),
  };

  return metadata;
}
