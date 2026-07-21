import { bannerImageUrl, brandingImageUrl } from "@/utility/imageUrl";
import { readCmsBlob } from "@/lib/cms/jsonStore";
import { DEFAULT_SEO, type CmsSeo } from "@/lib/cms/types";
import type { SeoItemType } from "@/type/seoType";
import { SeoContent } from "@/SeoContent/SeoContent";
import { appConfig } from "@/lib/config";

export async function getSeoConfig(): Promise<CmsSeo> {
  try {
    const cms = await readCmsBlob();
    return { ...DEFAULT_SEO, ...cms.seo };
  } catch {
    return { ...DEFAULT_SEO };
  }
}

/** Site-wide SEO used by the root layout / homepage, with static fallbacks. */
export async function getBaseSeoItem(): Promise<SeoItemType> {
  const seo = await getSeoConfig();
  const fallback = SeoContent.baseSeo;
  const image =
    brandingImageUrl(seo.og_image_path) ||
    bannerImageUrl(seo.og_image_path) ||
    fallback.image;

  const keywords = seo.keywords
    ? seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : fallback.keywords;

  return {
    title: seo.title?.trim() || fallback.title,
    description: seo.description?.trim() || fallback.description,
    image,
    siteUrl: fallback.siteUrl || appConfig.siteUrl || "",
    keywords,
  };
}
