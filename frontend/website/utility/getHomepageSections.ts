import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readCmsBlob, tableExists } from "@/lib/cms/jsonStore";
import type { HomepageSectionRow, HomepageSectionType } from "@/type/db";

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  sort: number;
  config: Record<string, unknown>;
}

function normalizeType(type: string): HomepageSectionType {
  if (type === "hero") return "banner";
  return type as HomepageSectionType;
}

function mapSection(row: HomepageSectionRow): HomepageSection {
  return {
    id: row.id,
    type: normalizeType(row.type),
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    sort: row.sort,
    config: row.config ?? {},
  };
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  try {
    if (await tableExists("homepage_sections")) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("active", true)
        .order("sort", { ascending: true });

      if (!error && data && data.length > 0) {
        return (data as HomepageSectionRow[]).map(mapSection);
      }
    }

    const cms = await readCmsBlob();
    return cms.homepage_sections
      .filter((s) => s.active)
      .sort((a, b) => a.sort - b.sort)
      .map(mapSection);
  } catch {
    return [];
  }
}
