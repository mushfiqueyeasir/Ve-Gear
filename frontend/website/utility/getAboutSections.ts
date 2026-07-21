import {
  ensureAboutSections,
  type AboutSectionRow,
} from "@/lib/cms/aboutSections";
import { readCmsBlob } from "@/lib/cms/jsonStore";

export async function getAboutSections(): Promise<AboutSectionRow[]> {
  try {
    const cms = await readCmsBlob();
    return ensureAboutSections(cms.about_sections ?? []).filter(
      (s) => s.active,
    );
  } catch {
    return ensureAboutSections([]).filter((s) => s.active);
  }
}
