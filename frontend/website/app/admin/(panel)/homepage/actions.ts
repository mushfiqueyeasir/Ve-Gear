"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  HOMEPAGE_SECTION_TYPES,
  type HomepageSectionRow,
  type HomepageSectionType,
} from "@/type/db";
import { readCmsBlob, tableExists, writeCmsBlob } from "@/lib/cms/jsonStore";

export interface SectionInput {
  id: string;
  type: HomepageSectionType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  active: boolean;
  config?: Record<string, unknown>;
}

function revalidate() {
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/** Normalize legacy "hero" rows to "banner". */
function normalizeSectionType(type: string): HomepageSectionType | null {
  if (type === "hero") return "banner";
  if (HOMEPAGE_SECTION_TYPES.includes(type as HomepageSectionType)) {
    return type as HomepageSectionType;
  }
  return null;
}

/** Merge stored rows with the fixed section list (by type). Never invent new types. */
function ensurePredefined(
  existing: HomepageSectionRow[],
): HomepageSectionRow[] {
  const byType = new Map<HomepageSectionType, HomepageSectionRow>();
  for (const row of existing) {
    const type = normalizeSectionType(row.type);
    if (type && !byType.has(type)) {
      byType.set(type, { ...row, type });
    }
  }

  return DEFAULT_HOMEPAGE_SECTIONS.map((def) => {
    const found = byType.get(def.type);
    if (!found) return { ...def };
    return {
      ...found,
      type: def.type,
      id: found.id || def.id,
      config: {
        ...(def.config ?? {}),
        ...(found.config ?? {}),
      },
    };
  }).sort((a, b) => a.sort - b.sort);
}

async function persistSections(
  rows: HomepageSectionRow[],
): Promise<{ error?: string }> {
  if (await tableExists("homepage_sections")) {
    const supabase = await createSupabaseServerClient();
    for (const row of rows) {
      const { error } = await supabase.from("homepage_sections").upsert({
        id: row.id,
        type: row.type,
        title: row.title,
        subtitle: row.subtitle,
        body: row.body,
        sort: row.sort,
        active: row.active,
        config: row.config ?? {},
        updated_at: row.updated_at,
      });
      if (error) return { error: error.message };
    }
    return {};
  }

  const cms = await readCmsBlob();
  cms.homepage_sections = rows;
  return writeCmsBlob(cms);
}

export async function listSections(): Promise<HomepageSectionRow[]> {
  let existing: HomepageSectionRow[] = [];

  if (await tableExists("homepage_sections")) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort", { ascending: true });
    existing = (data ?? []) as HomepageSectionRow[];
  } else {
    const cms = await readCmsBlob();
    existing = cms.homepage_sections;
  }

  const ensured = ensurePredefined(existing);
  const missing = ensured.filter(
    (row) =>
      !existing.some(
        (e) => normalizeSectionType(String(e.type)) === row.type,
      ),
  );
  const needsMigrate = existing.some((e) => String(e.type) === "hero");

  if (missing.length > 0 || needsMigrate) {
    await persistSections(ensured);
  }

  return ensured;
}

export async function saveSection(
  input: SectionInput,
): Promise<{ error?: string; id?: string }> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }
  if (!input.id) {
    return { error: "Homepage sections are predefined and cannot be created." };
  }
  const inputType = normalizeSectionType(input.type);
  if (!inputType) {
    return { error: "Invalid section type." };
  }

  const rows = await listSections();
  const current = rows.find((r) => r.id === input.id);
  if (!current) {
    return { error: "Section not found." };
  }
  if (current.type !== inputType) {
    return { error: "Section type cannot be changed." };
  }

  const now = new Date().toISOString();
  const config = {
    ...(current.config ?? {}),
    ...(input.config ?? {}),
  };
  const payload = {
    type: current.type,
    title: input.title,
    subtitle: input.subtitle,
    body: input.body,
    sort: current.sort,
    active: input.active,
    config,
    updated_at: now,
  };

  if (await tableExists("homepage_sections")) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("homepage_sections")
      .update(payload)
      .eq("id", input.id);
    if (error) return { error: error.message };
    revalidate();
    return { id: input.id };
  }

  const cms = await readCmsBlob();
  cms.homepage_sections = cms.homepage_sections.map((x) =>
    x.id === input.id
      ? {
          ...x,
          ...payload,
          type: current.type,
        }
      : x,
  );
  // Ensure row exists in blob after ensurePredefined
  if (!cms.homepage_sections.some((x) => x.id === input.id)) {
    cms.homepage_sections = ensurePredefined(cms.homepage_sections).map((x) =>
      x.id === input.id ? { ...x, ...payload, type: current.type } : x,
    );
  }
  const res = await writeCmsBlob(cms);
  if (res.error) return { error: res.error };
  revalidate();
  return { id: input.id };
}

export async function deleteSection(): Promise<{ error?: string }> {
  return {
    error: "Homepage sections are predefined and cannot be deleted. Hide them instead.",
  };
}

export async function toggleSection(
  id: string,
  active: boolean,
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  if (await tableExists("homepage_sections")) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("homepage_sections")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const cms = await readCmsBlob();
    let rows = ensurePredefined(cms.homepage_sections);
    rows = rows.map((x) =>
      x.id === id ? { ...x, active, updated_at: new Date().toISOString() } : x,
    );
    cms.homepage_sections = rows;
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }
  revalidate();
}

export async function reorderSections(
  orderedIds: string[],
): Promise<{ error?: string } | void> {
  const s = await requireAdminSession();
  if (!canWrite(s.role)) {
    return { error: "You do not have permission to do this." };
  }

  const rows = await listSections();
  if (
    orderedIds.length !== rows.length ||
    !orderedIds.every((id) => rows.some((r) => r.id === id))
  ) {
    return { error: "Invalid section order." };
  }

  const now = new Date().toISOString();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const next = orderedIds.map((id, index) => ({
    ...byId.get(id)!,
    sort: index,
    updated_at: now,
  }));

  if (await tableExists("homepage_sections")) {
    const supabase = await createSupabaseServerClient();
    for (const row of next) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({ sort: row.sort, updated_at: now })
        .eq("id", row.id);
      if (error) return { error: error.message };
    }
  } else {
    const cms = await readCmsBlob();
    cms.homepage_sections = next;
    const res = await writeCmsBlob(cms);
    if (res.error) return { error: res.error };
  }

  revalidate();
}
