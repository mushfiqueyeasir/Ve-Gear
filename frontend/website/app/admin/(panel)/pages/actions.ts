"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import {
  DEFAULT_PAGES,
  readCmsBlob,
  tableExists,
  writeCmsBlob,
  type CmsPage,
  type CmsPageSlug,
} from "@/lib/cms/jsonStore";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SLUGS: CmsPageSlug[] = ["about", "terms", "privacy", "refund"];

const STORE_PATH: Record<CmsPageSlug, string> = {
  about: "/about-us",
  terms: "/terms-of-service",
  privacy: "/privacy-policy",
  refund: "/refund-policy",
};

export async function listPages(): Promise<CmsPage[]> {
  if (await tableExists("content_pages")) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("content_pages").select("*");
    const rows = (data ?? []) as {
      slug: CmsPageSlug;
      title: string;
      body_html: string;
      updated_at: string;
    }[];
    return SLUGS.map((slug) => {
      const row = rows.find((r) => r.slug === slug);
      return row
        ? {
            slug,
            title: row.title,
            body_html: row.body_html,
            updated_at: row.updated_at,
          }
        : DEFAULT_PAGES[slug];
    });
  }
  const cms = await readCmsBlob();
  return SLUGS.map((slug) => cms.pages[slug] ?? DEFAULT_PAGES[slug]);
}

export async function getPage(slug: CmsPageSlug): Promise<CmsPage> {
  const pages = await listPages();
  return pages.find((p) => p.slug === slug) ?? DEFAULT_PAGES[slug];
}

export async function savePage(input: {
  slug: CmsPageSlug;
  title: string;
  body_html: string;
}): Promise<{ error?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!SLUGS.includes(input.slug)) return { error: "Invalid page." };
  if (!input.title.trim()) return { error: "Title is required." };

  const now = new Date().toISOString();
  const page: CmsPage = {
    slug: input.slug,
    title: input.title.trim(),
    body_html: input.body_html,
    updated_at: now,
  };

  if (await tableExists("content_pages")) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("content_pages").upsert({
      slug: page.slug,
      title: page.title,
      body_html: page.body_html,
      updated_at: now,
    });
    if (error) return { error: error.message };
  } else {
    const cms = await readCmsBlob();
    cms.pages[input.slug] = page;
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }

  revalidatePath("/admin/pages");
  revalidatePath(STORE_PATH[input.slug]);
  return {};
}
