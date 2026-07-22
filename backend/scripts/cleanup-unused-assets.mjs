/**
 * Delete Supabase Storage objects that are no longer referenced in the DB.
 *
 * Usage:
 *   node scripts/cleanup-unused-assets.mjs
 *   node scripts/cleanup-unused-assets.mjs --dry-run
 *
 * Env vars override the inline defaults when set (e.g. GitHub Actions secrets).
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Inline project credentials (env overrides these when present).
 * Service role is enough for list/query/delete — no Management API token needed.
 * (GitHub push protection blocks sbp_ personal access tokens in the repo.)
 */
const INLINE_CONFIG = {
  projectRef: "lznxmqehyzqwqfkfgxxh",
  url: "https://lznxmqehyzqwqfkfgxxh.supabase.co",
  serviceRoleKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bnhtcWVoeXpxd3Fma2ZneHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYxMDAyMSwiZXhwIjoyMTAwMTg2MDIxfQ.3vluxV1eRYocWjnU8Ex56AglVyUKgdcmfp8Y8VEzBJQ",
};

const BUCKETS = [
  "product-images",
  "category-images",
  "review-images",
  "promotion-images",
  "branding",
  "banner-images",
];

/** Skip deleting files newer than this (avoids races with in-flight uploads). */
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

/** Seed / code-default assets — keep even if not currently referenced in DB. */
const PROTECTED_PREFIXES = ["lovable/"];

const DELETE_BATCH = 100;
const LIST_PAGE = 1000;

const dryRun = process.argv.includes("--dry-run");

function loadConfig() {
  return {
    projectRef:
      process.env.SUPABASE_PROJECT_REF?.trim() || INLINE_CONFIG.projectRef,
    url: process.env.SUPABASE_URL?.trim() || INLINE_CONFIG.url,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      INLINE_CONFIG.serviceRoleKey,
  };
}

function normalizePath(raw, bucket) {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(marker);
    if (idx === -1) return null;
    try {
      return decodeURIComponent(value.slice(idx + marker.length).split("?")[0]);
    } catch {
      return value.slice(idx + marker.length).split("?")[0];
    }
  }

  return value.replace(/^\/+/, "");
}

function addPath(set, bucket, raw) {
  const path = normalizePath(raw, bucket);
  if (path) set.add(path);
}

function collectFromCms(cms, referenced) {
  if (!cms || typeof cms !== "object") return;

  for (const banner of cms.banners ?? []) {
    addPath(referenced.get("banner-images"), "banner-images", banner?.image_path);
    addPath(
      referenced.get("banner-images"),
      "banner-images",
      banner?.mobile_image_path,
    );
  }

  for (const section of cms.about_sections ?? []) {
    const cfg = section?.config ?? {};
    const path = cfg.image_path;
    const bucketKey =
      cfg.image_bucket === "branding" ? "branding" : "banner-images";
    addPath(referenced.get(bucketKey), bucketKey, path);
  }

  for (const section of cms.homepage_sections ?? []) {
    const cfg = section?.config ?? {};
    if (cfg.image_path) {
      const bucketKey =
        cfg.image_bucket === "branding"
          ? "branding"
          : cfg.image_bucket === "product"
            ? "product-images"
            : "banner-images";
      addPath(referenced.get(bucketKey), bucketKey, cfg.image_path);
    }
  }

  addPath(referenced.get("branding"), "branding", cms.favicon_path);
  addPath(referenced.get("branding"), "branding", cms.seo?.og_image_path);

  for (const page of Object.values(cms.pages_seo ?? {})) {
    addPath(referenced.get("branding"), "branding", page?.og_image_path);
  }

  // Sweep HTML blobs for any public storage URLs.
  const htmlChunks = [];
  for (const page of Object.values(cms.pages ?? {})) {
    if (page?.body_html) htmlChunks.push(page.body_html);
  }
  for (const section of cms.about_sections ?? []) {
    if (section?.config?.body_html) htmlChunks.push(section.config.body_html);
    if (section?.body) htmlChunks.push(String(section.body));
  }
  for (const section of cms.homepage_sections ?? []) {
    if (section?.body) htmlChunks.push(String(section.body));
  }

  const urlRe =
    /\/storage\/v1\/object\/public\/(product-images|category-images|review-images|promotion-images|branding|banner-images)\/([^"'?\s]+)/g;
  for (const html of htmlChunks) {
    let match;
    while ((match = urlRe.exec(html)) !== null) {
      addPath(referenced.get(match[1]), match[1], decodeURIComponent(match[2]));
    }
  }
}

async function collectReferencedPaths(supabase) {
  const referenced = new Map(BUCKETS.map((b) => [b, new Set()]));

  const [
    productImages,
    categories,
    reviews,
    promotions,
    banners,
    siteSettings,
    homepageSections,
    products,
  ] = await Promise.all([
    supabase.from("product_images").select("path"),
    supabase.from("categories").select("image_path"),
    supabase.from("reviews").select("image_path"),
    supabase.from("promotions").select("image_path"),
    supabase.from("banners").select("image_path, mobile_image_path"),
    supabase
      .from("site_settings")
      .select("logo_path, favicon_path, socials")
      .limit(1)
      .maybeSingle(),
    supabase.from("homepage_sections").select("config, body"),
    supabase.from("products").select("description"),
  ]);

  const fail = (label, res) => {
    if (res.error) {
      // Table may not exist in older envs — warn and continue.
      console.warn(`[warn] ${label}: ${res.error.message}`);
    }
  };

  fail("product_images", productImages);
  fail("categories", categories);
  fail("reviews", reviews);
  fail("promotions", promotions);
  fail("banners", banners);
  fail("site_settings", siteSettings);
  fail("homepage_sections", homepageSections);
  fail("products", products);

  for (const row of productImages.data ?? []) {
    addPath(referenced.get("product-images"), "product-images", row.path);
  }
  for (const row of categories.data ?? []) {
    addPath(referenced.get("category-images"), "category-images", row.image_path);
  }
  for (const row of reviews.data ?? []) {
    addPath(referenced.get("review-images"), "review-images", row.image_path);
  }
  for (const row of promotions.data ?? []) {
    addPath(
      referenced.get("promotion-images"),
      "promotion-images",
      row.image_path,
    );
  }
  for (const row of banners.data ?? []) {
    addPath(referenced.get("banner-images"), "banner-images", row.image_path);
    addPath(
      referenced.get("banner-images"),
      "banner-images",
      row.mobile_image_path,
    );
  }

  if (siteSettings.data) {
    addPath(
      referenced.get("branding"),
      "branding",
      siteSettings.data.logo_path,
    );
    addPath(
      referenced.get("branding"),
      "branding",
      siteSettings.data.favicon_path,
    );
    const socials = siteSettings.data.socials ?? {};
    collectFromCms(socials._cms, referenced);
  }

  for (const row of homepageSections.data ?? []) {
    const cfg = row.config ?? {};
    if (cfg.image_path) {
      const bucketKey =
        cfg.image_bucket === "branding" ? "branding" : "banner-images";
      addPath(referenced.get(bucketKey), bucketKey, cfg.image_path);
    }
  }

  const descRe =
    /\/storage\/v1\/object\/public\/(product-images|category-images|review-images|promotion-images|branding|banner-images)\/([^"'?\s]+)/g;
  for (const row of products.data ?? []) {
    if (!row.description) continue;
    let match;
    while ((match = descRe.exec(row.description)) !== null) {
      addPath(referenced.get(match[1]), match[1], decodeURIComponent(match[2]));
    }
  }

  return referenced;
}

async function listAllObjects(supabase, bucket) {
  const files = [];

  async function walk(prefix) {
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit: LIST_PAGE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new Error(`[${bucket}] list ${prefix || "/"}: ${error.message}`);
      if (!data?.length) break;

      for (const item of data) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        // Folders have id === null in Storage list responses.
        const isFolder = item.id == null && !item.metadata;
        if (isFolder) {
          await walk(path);
        } else {
          files.push({
            path,
            updatedAt: item.updated_at || item.created_at || null,
          });
        }
      }

      if (data.length < LIST_PAGE) break;
      offset += LIST_PAGE;
    }
  }

  await walk("");
  return files;
}

async function deletePaths(supabase, bucket, paths) {
  let deleted = 0;
  for (let i = 0; i < paths.length; i += DELETE_BATCH) {
    const chunk = paths.slice(i, i + DELETE_BATCH);
    if (dryRun) {
      deleted += chunk.length;
      continue;
    }
    const { error } = await supabase.storage.from(bucket).remove(chunk);
    if (error) {
      console.error(`[${bucket}] delete failed: ${error.message}`);
      continue;
    }
    deleted += chunk.length;
  }
  return deleted;
}

function isOldEnough(updatedAt) {
  if (!updatedAt) return true;
  const ts = Date.parse(updatedAt);
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts >= MIN_AGE_MS;
}

async function main() {
  const config = loadConfig();
  const url =
    config.url ||
    (config.projectRef ? `https://${config.projectRef}.supabase.co` : "");
  if (!url) throw new Error("SUPABASE_URL or SUPABASE_PROJECT_REF is required");

  if (!config.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  const supabase = createClient(url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    `Cleanup start${dryRun ? " (dry-run)" : ""} · project ${config.projectRef || url}`,
  );

  const referenced = await collectReferencedPaths(supabase);
  let totalOrphans = 0;
  let totalDeleted = 0;
  let totalSkippedFresh = 0;

  for (const bucket of BUCKETS) {
    const used = referenced.get(bucket) ?? new Set();
    let objects;
    try {
      objects = await listAllObjects(supabase, bucket);
    } catch (err) {
      console.warn(`[warn] ${bucket}: ${err.message}`);
      continue;
    }

    const orphans = [];
    for (const obj of objects) {
      if (used.has(obj.path)) continue;
      if (PROTECTED_PREFIXES.some((p) => obj.path.startsWith(p))) continue;
      if (!isOldEnough(obj.updatedAt)) {
        totalSkippedFresh += 1;
        continue;
      }
      orphans.push(obj.path);
    }

    console.log(
      `[${bucket}] listed=${objects.length} referenced=${used.size} orphans=${orphans.length}`,
    );

    if (orphans.length === 0) continue;

    for (const path of orphans.slice(0, 20)) {
      console.log(`  - ${dryRun ? "would delete" : "delete"} ${path}`);
    }
    if (orphans.length > 20) {
      console.log(`  … and ${orphans.length - 20} more`);
    }

    totalOrphans += orphans.length;
    totalDeleted += await deletePaths(supabase, bucket, orphans);
  }

  console.log(
    `Done. orphans=${totalOrphans} ${dryRun ? "wouldDelete" : "deleted"}=${totalDeleted} skippedFresh=${totalSkippedFresh}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
