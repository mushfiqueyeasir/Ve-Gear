import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  type BannerRow,
  type HomepageSectionRow,
} from "@/type/db";
import {
  DEFAULT_CURRENCY_SETTINGS,
  DEFAULT_SEO,
  type CmsAnnouncement,
  type CmsPage,
  type CmsPageSlug,
  type CmsSeo,
  type CurrencySettings,
} from "./types";
import { normalizeCurrencySettings } from "@/lib/currency";
import {
  DEFAULT_PALETTE,
  normalizePalette,
  type ThemePalette,
} from "@/lib/theme/palette";
import {
  ABOUT_INTRO_HTML,
  ABOUT_PAGE_TITLE,
  PRIVACY_BODY_HTML,
  PRIVACY_PAGE_TITLE,
  REFUND_BODY_HTML,
  REFUND_PAGE_TITLE,
  TERMS_BODY_HTML,
  TERMS_PAGE_TITLE,
} from "./defaultPageContent";
import {
  DEFAULT_ABOUT_SECTIONS,
  ensureAboutSections,
  type AboutSectionRow,
} from "./aboutSections";

export type {
  CmsAnnouncement,
  CmsPage,
  CmsPageSlug,
  CmsSeo,
  CurrencySettings,
} from "./types";
export { DEFAULT_SEO, DEFAULT_CURRENCY_SETTINGS } from "./types";
export type { AboutSectionRow, AboutSectionType } from "./aboutSections";
export {
  ABOUT_SECTION_TYPES,
  DEFAULT_ABOUT_SECTIONS,
  ensureAboutSections,
} from "./aboutSections";

export interface CmsBlob {
  banners: BannerRow[];
  homepage_sections: HomepageSectionRow[];
  about_sections: AboutSectionRow[];
  pages: Record<CmsPageSlug, CmsPage>;
  announcement: CmsAnnouncement;
  seo: CmsSeo;
  currencies: CurrencySettings;
  /** Fallback when site_settings.favicon_path column is missing. */
  favicon_path: string | null;
  palette: ThemePalette;
}

const CMS_KEY = "_cms";

export const DEFAULT_PAGES: Record<CmsPageSlug, CmsPage> = {
  about: {
    slug: "about",
    title: ABOUT_PAGE_TITLE,
    body_html: ABOUT_INTRO_HTML,
    updated_at: new Date(0).toISOString(),
  },
  terms: {
    slug: "terms",
    title: TERMS_PAGE_TITLE,
    body_html: TERMS_BODY_HTML,
    updated_at: new Date(0).toISOString(),
  },
  privacy: {
    slug: "privacy",
    title: PRIVACY_PAGE_TITLE,
    body_html: PRIVACY_BODY_HTML,
    updated_at: new Date(0).toISOString(),
  },
  refund: {
    slug: "refund",
    title: REFUND_PAGE_TITLE,
    body_html: REFUND_BODY_HTML,
    updated_at: new Date(0).toISOString(),
  },
};

function emptyCms(): CmsBlob {
  return {
    banners: [],
    homepage_sections: DEFAULT_HOMEPAGE_SECTIONS.map((s) => ({ ...s })),
    about_sections: DEFAULT_ABOUT_SECTIONS.map((s) => ({ ...s })),
    pages: { ...DEFAULT_PAGES },
    announcement: {
      text: "DROP 04 · LIVE NOW",
      active: false,
      url: "/product",
    },
    seo: { ...DEFAULT_SEO },
    currencies: { ...DEFAULT_CURRENCY_SETTINGS },
    favicon_path: null,
    palette: { ...DEFAULT_PALETTE },
  };
}

function normalize(raw: unknown): CmsBlob {
  const base = emptyCms();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<CmsBlob>;
  return {
    banners: Array.isArray(o.banners) ? o.banners : [],
    homepage_sections:
      Array.isArray(o.homepage_sections) && o.homepage_sections.length > 0
        ? o.homepage_sections
        : DEFAULT_HOMEPAGE_SECTIONS.map((s) => ({ ...s })),
    about_sections: ensureAboutSections(
      Array.isArray(o.about_sections) ? o.about_sections : [],
    ),
    pages: {
      about: { ...DEFAULT_PAGES.about, ...(o.pages?.about ?? {}) },
      terms: { ...DEFAULT_PAGES.terms, ...(o.pages?.terms ?? {}) },
      privacy: { ...DEFAULT_PAGES.privacy, ...(o.pages?.privacy ?? {}) },
      refund: { ...DEFAULT_PAGES.refund, ...(o.pages?.refund ?? {}) },
    },
    announcement: {
      ...base.announcement,
      ...(o.announcement ?? {}),
    },
    seo: {
      ...DEFAULT_SEO,
      ...(o.seo ?? {}),
    },
    currencies: normalizeCurrencySettings(o.currencies),
    favicon_path:
      typeof o.favicon_path === "string" && o.favicon_path.trim()
        ? o.favicon_path.trim()
        : null,
    palette: normalizePalette(o.palette),
  };
}

export async function tableExists(name: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from(name).select("id").limit(1);
    if (!error) return true;
    return !/Could not find the table|schema cache|does not exist/i.test(
      error.message || "",
    );
  } catch {
    return false;
  }
}

export async function readCmsBlob(): Promise<CmsBlob> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("socials")
      .eq("id", 1)
      .maybeSingle();
    const socials = (data?.socials ?? {}) as Record<string, unknown>;
    return normalize(socials[CMS_KEY]);
  } catch {
    return emptyCms();
  }
}

export async function writeCmsBlob(cms: CmsBlob): Promise<{ error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("socials")
      .eq("id", 1)
      .maybeSingle();
    const socials = {
      ...((data?.socials as Record<string, unknown>) ?? {}),
      [CMS_KEY]: cms,
    };
    const { error } = await supabase
      .from("site_settings")
      .update({ socials, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save CMS" };
  }
}

export function newId(): string {
  return crypto.randomUUID();
}
