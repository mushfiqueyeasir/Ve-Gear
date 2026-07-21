"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, isAdmin } from "@/lib/admin/auth";
import type { CmsSeo, CurrencySettings } from "@/lib/cms/types";
import { getCurrencyMeta, normalizeCurrencySettings } from "@/lib/currency";
import { normalizePalette, type ThemePalette } from "@/lib/theme/palette";

export interface SettingsInput {
  store_name: string;
  logo_path: string | null;
  favicon_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  currencies: CurrencySettings;
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
  seo: CmsSeo;
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
  if (!input.seo.title.trim()) {
    return { error: "SEO title is required." };
  }
  if (!input.seo.description.trim()) {
    return { error: "SEO description is required." };
  }

  const currencies = normalizeCurrencySettings(input.currencies);
  if (currencies.enabled.length === 0) {
    return { error: "Enable at least one currency." };
  }
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
      seo: {
        title: input.seo.title.trim(),
        description: input.seo.description.trim(),
        keywords: input.seo.keywords.trim(),
        og_image_path: input.seo.og_image_path,
      },
      currencies,
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
    shipping_flat: 0,
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
  return {};
}
