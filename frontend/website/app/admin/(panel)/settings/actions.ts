"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, isAdmin } from "@/lib/admin/auth";
import {
  normalizePagesSeo,
  SEO_PAGE_KEYS,
  SEO_PAGE_META,
  type CmsSeo,
  type CurrencySettings,
  type SeoPageKey,
} from "@/lib/cms/types";
import { getCurrencyMeta, normalizeCurrencySettings } from "@/lib/currency";
import { normalizeDeliveryCharges, type DeliveryCharges } from "@/lib/delivery";
import { normalizeChatWidgets, type ChatWidgets } from "@/lib/chatWidgets";
import { normalizePalette, type ThemePalette } from "@/lib/theme/palette";

export interface SettingsInput {
  store_name: string;
  logo_path: string | null;
  favicon_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  currencies: CurrencySettings;
  deliveryCharges: DeliveryCharges;
  chatWidgets: ChatWidgets;
  palette: ThemePalette;
  socials: Record<string, string>;
  google_analytics_id: string | null;
  meta_pixel_id: string | null;
  gtm_id: string | null;
  analytics_enabled: boolean;
  security_enabled: boolean;
  announcement_text: string | null;
  announcement_active: boolean;
  announcement_url: string | null;
  /** @deprecated Prefer pages_seo.home — kept for compatibility. */
  seo: CmsSeo;
  pages_seo: Record<SeoPageKey, CmsSeo>;
}

export async function saveSettings(
  input: SettingsInput,
): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!isAdmin(s.role)) {
    return { error: "You do not have permission to change store settings." };
  }

  if (!input.store_name.trim()) {
    return { error: "Store name is required." };
  }
  const pagesSeo = normalizePagesSeo(input.pages_seo, input.seo);
  for (const key of SEO_PAGE_KEYS) {
    const page = pagesSeo[key];
    if (!page.title.trim() || !page.description.trim()) {
      return {
        error: `SEO title and description are required for ${SEO_PAGE_META[key].label}.`,
      };
    }
    pagesSeo[key] = {
      title: page.title.trim(),
      description: page.description.trim(),
      keywords: page.keywords.trim(),
      og_image_path: page.og_image_path,
    };
  }

  const homeSeo = pagesSeo.home;

  const currencies = normalizeCurrencySettings(input.currencies);
  if (currencies.enabled.length === 0) {
    return { error: "Enable at least one currency." };
  }
  const deliveryCharges = normalizeDeliveryCharges(input.deliveryCharges);
  const chatWidgets = normalizeChatWidgets(input.chatWidgets);
  const defaultMeta = getCurrencyMeta(currencies.default);

  const supabase = await createSupabaseServerClient();

  const { data: current } = await supabase
    .from("site_settings")
    .select("socials")
    .eq("id", 1)
    .maybeSingle();
  const existing = (current?.socials as Record<string, unknown>) ?? {};
  const existingCms =
    existing._cms && typeof existing._cms === "object"
      ? (existing._cms as Record<string, unknown>)
      : {};

  // Always keep a CMS copy so favicon works before the DB column exists.
  const socials = {
    ...input.socials,
    _cms: {
      ...existingCms,
      announcement: {
        text: input.announcement_text,
        active: input.announcement_active,
        url: input.announcement_url,
      },
      seo: homeSeo,
      pages_seo: pagesSeo,
      currencies,
      deliveryCharges,
      chatWidgets,
      favicon_path: input.favicon_path,
      palette: normalizePalette(input.palette),
    },
  };

  const base = {
    store_name: input.store_name.trim(),
    logo_path: input.logo_path,
    favicon_path: input.favicon_path,
    contact_email: input.contact_email,
    contact_phone: input.contact_phone,
    address: input.address,
    currency: defaultMeta.code,
    currency_symbol: defaultMeta.symbol,
    shipping_flat: deliveryCharges.insideDhaka,
    free_shipping_threshold: null,
    socials,
    google_analytics_id: input.google_analytics_id,
    meta_pixel_id: input.meta_pixel_id,
    gtm_id: input.gtm_id,
    analytics_enabled: input.analytics_enabled,
    security_enabled: input.security_enabled,
    updated_at: new Date().toISOString(),
  };

  const withAnnouncement = {
    ...base,
    announcement_text: input.announcement_text,
    announcement_active: input.announcement_active,
    announcement_url: input.announcement_url,
  };

  let { error } = await supabase
    .from("site_settings")
    .update(withAnnouncement)
    .eq("id", 1);

  if (error) {
    const payload = { ...withAnnouncement } as Record<string, unknown>;
    if (/favicon_path/i.test(error.message)) {
      delete payload.favicon_path;
    }
    if (/announcement_/i.test(error.message)) {
      delete payload.announcement_text;
      delete payload.announcement_active;
      delete payload.announcement_url;
    }
    ({ error } = await supabase
      .from("site_settings")
      .update(payload)
      .eq("id", 1));
  }

  if (error) {
    const minimal = { ...base } as Record<string, unknown>;
    delete minimal.favicon_path;
    const { error: fallbackError } = await supabase
      .from("site_settings")
      .update(minimal)
      .eq("id", 1);
    if (fallbackError) return { error: fallbackError.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  for (const key of SEO_PAGE_KEYS) {
    const path = SEO_PAGE_META[key].path;
    if (path !== "/") revalidatePath(path);
  }
  return {};
}
