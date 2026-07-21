import { ABOUT_INTRO_HTML } from "./defaultPageContent";

export type AboutSectionType =
  | "hero"
  | "stats"
  | "story"
  | "values"
  | "craft"
  | "cta";

export const ABOUT_SECTION_TYPES: AboutSectionType[] = [
  "hero",
  "stats",
  "story",
  "values",
  "craft",
  "cta",
];

export interface AboutStatItem {
  label: string;
  value: string;
}

export interface AboutValueItem {
  title: string;
  body: string;
}

export interface AboutCraftItem {
  label: string;
  sub: string;
  icon: string;
}

export interface AboutSectionRow {
  id: string;
  type: AboutSectionType;
  title: string | null;
  sort: number;
  active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const now = () => new Date(0).toISOString();

export const DEFAULT_ABOUT_SECTIONS: AboutSectionRow[] = [
  {
    id: "about-hero",
    type: "hero",
    title: "Hero",
    sort: 0,
    active: true,
    config: {
      eyebrow: "Our story",
      headline_line1: "Not just ride.",
      headline_line2: "Ride with style.",
      subtitle:
        "Premium oversized streetwear engineered for riders — heavyweight cotton, honest construction, and drops built to be worn hard.",
      cta_primary_label: "Shop the drop",
      cta_primary_url: "/product",
      cta_secondary_label: "Talk to us",
      cta_secondary_url: "/contact-us",
      image_path: "lovable/hero-biker.jpg",
      image_bucket: "banner",
    },
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "about-stats",
    type: "stats",
    title: "Stats bar",
    sort: 1,
    active: true,
    config: {
      items: [
        { label: "Fabric", value: "240 GSM" },
        { label: "Cotton", value: "100%" },
        { label: "Fit", value: "Oversized" },
        { label: "Focus", value: "Riders" },
      ] satisfies AboutStatItem[],
    },
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "about-story",
    type: "story",
    title: "Story",
    sort: 2,
    active: true,
    config: {
      eyebrow: "Why we exist",
      title: "Streetwear that earns its miles.",
      body_html: ABOUT_INTRO_HTML,
      extra:
        "We started VE Gear because most “rider merch” felt thin — light fabric, forgettable cuts, gone after a few washes. We wanted the opposite: pieces you reach for every day, whether you're heading out for a ride or just living in the city.",
      image_path: "lovable/void-oversized.jpg",
      image_bucket: "banner",
    },
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "about-values",
    type: "values",
    title: "Values",
    sort: 3,
    active: true,
    config: {
      eyebrow: "What we stand for",
      title: "Quality over noise.",
      items: [
        {
          title: "Built to perform",
          body: "Heavyweight fabric, reinforced stitching, and fits cut for real movement — on the bike and off it.",
        },
        {
          title: "Designed with intent",
          body: "Clean silhouettes, considered details, and drops that feel like a uniform — not disposable fashion.",
        },
        {
          title: "Made to last",
          body: "We obsess over GSM, drape, and finish so your essentials survive wash after wash and season after season.",
        },
      ] satisfies AboutValueItem[],
    },
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "about-craft",
    type: "craft",
    title: "Craft / fabric",
    sort: 4,
    active: true,
    config: {
      eyebrow: "Material study",
      title_line1: "Every thread",
      title_line2: "engineered.",
      body: "Cut from long-staple cotton and checked for weight, drape, and finish. This isn't fast fashion — it's the last tee you buy this season.",
      image_path: "lovable/fabric-texture.jpg",
      image_bucket: "branding",
      fabric_label: "Fabric",
      fabric_value: "240 GSM Cotton",
      fabric_tag: "// LAB 04",
      items: [
        { icon: "Layers", label: "240 GSM", sub: "Heavyweight hand" },
        { icon: "Shirt", label: "Long-staple cotton", sub: "Soft, strong fibre" },
        { icon: "Scissors", label: "Drop shoulder", sub: "Signature cut" },
        { icon: "Zap", label: "Boxy oversized", sub: "Room to move" },
        { icon: "Sparkles", label: "Pre-shrunk", sub: "Stable after wash" },
        { icon: "Award", label: "Double-needle", sub: "Premium stitch" },
      ] satisfies AboutCraftItem[],
    },
    created_at: now(),
    updated_at: now(),
  },
  {
    id: "about-cta",
    type: "cta",
    title: "Community CTA",
    sort: 5,
    active: true,
    config: {
      eyebrow: "Community",
      title: "Join the riders who wear it hard.",
      body: "When you choose VE Gear, you join people who care about fabric weight, honest fits, and gear that still looks right after the miles. Thank you for riding with us.",
      cta_primary_label: "Explore products",
      cta_primary_url: "/product",
      cta_secondary_label: "See community",
      cta_secondary_url: "/reviews",
    },
    created_at: now(),
    updated_at: now(),
  },
];

export function ensureAboutSections(
  existing: AboutSectionRow[],
): AboutSectionRow[] {
  const byType = new Map(existing.map((s) => [s.type, s]));
  const merged = DEFAULT_ABOUT_SECTIONS.map((def, index) => {
    const cur = byType.get(def.type);
    if (!cur) return { ...def, sort: index };
    return {
      ...def,
      ...cur,
      type: def.type,
      id: cur.id || def.id,
      sort: typeof cur.sort === "number" ? cur.sort : index,
      config: { ...def.config, ...(cur.config ?? {}) },
    };
  });
  return merged.sort((a, b) => a.sort - b.sort);
}
