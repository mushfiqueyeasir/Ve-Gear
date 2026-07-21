/**
 * Upload Lovable mock assets to Supabase Storage and seed catalog/CMS data
 * so the dark streetwear UI has matching images and content.
 *
 * Usage: node scripts/seed-lovable.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assetsDir = path.resolve(root, "../test/src/assets");

function loadEnv() {
  const envPath = path.join(root, ".env");
  const raw = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function ensureBucket(name) {
  const { data: buckets } = await sb.storage.listBuckets();
  if (!(buckets || []).some((b) => b.name === name)) {
    const { error } = await sb.storage.createBucket(name, { public: true });
    if (error) throw new Error(`createBucket ${name}: ${error.message}`);
    console.log("created bucket", name);
  }
}

async function upload(
  bucket,
  objectPath,
  filePath,
  contentType = "image/jpeg",
) {
  const body = fs.readFileSync(filePath);
  const { error } = await sb.storage.from(bucket).upload(objectPath, body, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });
  if (error)
    throw new Error(`upload ${bucket}/${objectPath}: ${error.message}`);
  console.log("uploaded", `${bucket}/${objectPath}`);
  return objectPath;
}

async function tableExists(name) {
  const { error } = await sb.from(name).select("id").limit(1);
  if (!error) return true;
  return !/Could not find the table|schema cache/i.test(error.message || "");
}

async function main() {
  console.log("Assets from:", assetsDir);
  if (!fs.existsSync(assetsDir)) {
    console.error("Lovable assets folder not found:", assetsDir);
    process.exit(1);
  }

  for (const b of [
    "product-images",
    "category-images",
    "review-images",
    "promotion-images",
    "branding",
    "banner-images",
  ]) {
    await ensureBucket(b);
  }

  // --- Upload assets ---
  const files = {
    hero: path.join(assetsDir, "hero-biker.jpg"),
    fabric: path.join(assetsDir, "fabric-texture.jpg"),
    c1: path.join(assetsDir, "collection-1.jpg"),
    c2: path.join(assetsDir, "collection-2.jpg"),
    p1: path.join(assetsDir, "product-1.jpg"),
    p2: path.join(assetsDir, "product-2.jpg"),
    p3: path.join(assetsDir, "product-3.jpg"),
    p4: path.join(assetsDir, "product-4.jpg"),
    logoWhite: path.join(assetsDir, "logo-white.png"),
    logoBlack: path.join(assetsDir, "logo-black.png"),
  };

  const heroPath = await upload(
    "banner-images",
    "lovable/hero-biker.jpg",
    files.hero,
  );
  await upload(
    "branding",
    "lovable/logo-white.png",
    files.logoWhite,
    "image/png",
  );
  const logoBlackPath = await upload(
    "branding",
    "lovable/logo-black.png",
    files.logoBlack,
    "image/png",
  );
  await upload("branding", "lovable/fabric-texture.jpg", files.fabric);

  const catPaths = {
    "black-collection": await upload(
      "category-images",
      "lovable/black-collection.jpg",
      files.c1,
    ),
    "oversized-drop": await upload(
      "category-images",
      "lovable/oversized-drop.jpg",
      files.p1,
    ),
    "limited-edition": await upload(
      "category-images",
      "lovable/limited-edition.jpg",
      files.p4,
    ),
    "rider-essentials": await upload(
      "category-images",
      "lovable/rider-essentials.jpg",
      files.c2,
    ),
  };

  const productImages = {
    "shadow-drop-tee": await upload(
      "product-images",
      "lovable/shadow-drop-tee.jpg",
      files.p1,
    ),
    "void-oversized": await upload(
      "product-images",
      "lovable/void-oversized.jpg",
      files.p2,
    ),
    "bone-rider": await upload(
      "product-images",
      "lovable/bone-rider.jpg",
      files.p3,
    ),
    "coral-signal": await upload(
      "product-images",
      "lovable/coral-signal.jpg",
      files.p4,
    ),
  };

  const reviewImages = [
    await upload("review-images", "lovable/review-1.jpg", files.hero),
    await upload("review-images", "lovable/review-2.jpg", files.c1),
    await upload("review-images", "lovable/review-3.jpg", files.p1),
    await upload("review-images", "lovable/review-4.jpg", files.p4),
    await upload("review-images", "lovable/review-5.jpg", files.c2),
    await upload("review-images", "lovable/review-6.jpg", files.p2),
  ];

  await upload("promotion-images", "lovable/drop-04.jpg", files.p4);

  // Also mirror into Next public for offline/dev fallback
  const publicLogo = path.join(root, "public/images/logo");
  const publicLovable = path.join(root, "public/images/lovable");
  fs.mkdirSync(publicLogo, { recursive: true });
  fs.mkdirSync(publicLovable, { recursive: true });
  for (const [name, src] of Object.entries({
    "logo-white.png": files.logoWhite,
    "logo-black.png": files.logoBlack,
  })) {
    fs.copyFileSync(src, path.join(publicLogo, name));
  }
  for (const [name, src] of Object.entries({
    "hero-biker.jpg": files.hero,
    "fabric-texture.jpg": files.fabric,
    "collection-1.jpg": files.c1,
    "collection-2.jpg": files.c2,
    "product-1.jpg": files.p1,
    "product-2.jpg": files.p2,
    "product-3.jpg": files.p3,
    "product-4.jpg": files.p4,
  })) {
    fs.copyFileSync(src, path.join(publicLovable, name));
  }
  console.log("mirrored assets into public/images/");

  // --- Site settings ---
  const { error: settingsErr } = await sb.from("site_settings").upsert({
    id: 1,
    store_name: "VE Gear",
    logo_path: logoBlackPath,
    contact_email: "hello@vegear.com",
    currency: "USD",
    currency_symbol: "$",
    shipping_flat: 5,
    free_shipping_threshold: 100,
    announcement_text: "DROP 04 · LIVE NOW — Free shipping over $100",
    announcement_active: true,
    announcement_url: "/product",
    socials: {
      instagram: "https://instagram.com/vegear",
      twitter: "https://x.com/vegear",
      youtube: "https://youtube.com/@vegear",
    },
    updated_at: new Date().toISOString(),
  });
  if (settingsErr) {
    // announcement columns may not exist yet — retry without them
    console.warn(
      "settings upsert with announcement failed:",
      settingsErr.message,
    );
    const { error: e2 } = await sb.from("site_settings").upsert({
      id: 1,
      store_name: "VE Gear",
      logo_path: logoBlackPath,
      contact_email: "hello@vegear.com",
      currency: "USD",
      currency_symbol: "$",
      shipping_flat: 5,
      free_shipping_threshold: 100,
      socials: {
        instagram: "https://instagram.com/vegear",
        twitter: "https://x.com/vegear",
        youtube: "https://youtube.com/@vegear",
      },
      updated_at: new Date().toISOString(),
    });
    if (e2) throw e2;
  } else {
    console.log("updated site_settings");
  }

  // --- Categories (replace demo set with Lovable collections) ---
  const categories = [
    {
      name: "Black Collection",
      slug: "black-collection",
      description: "12 Pieces — editorial black essentials",
      sort: 10,
      image_path: catPaths["black-collection"],
    },
    {
      name: "Oversized Drop",
      slug: "oversized-drop",
      description: "08 Pieces — boxy, drop-shoulder cuts",
      sort: 20,
      image_path: catPaths["oversized-drop"],
    },
    {
      name: "Limited Edition",
      slug: "limited-edition",
      description: "04 Pieces — Drop 04 exclusives",
      sort: 30,
      image_path: catPaths["limited-edition"],
    },
    {
      name: "Rider Essentials",
      slug: "rider-essentials",
      description: "16 Pieces — engineered for the road",
      sort: 40,
      image_path: catPaths["rider-essentials"],
    },
  ];

  for (const c of categories) {
    const { error } = await sb
      .from("categories")
      .upsert(c, { onConflict: "slug" });
    if (error) throw new Error(`category ${c.slug}: ${error.message}`);
  }
  console.log("seeded categories");

  const { data: catRows, error: catFetchErr } = await sb
    .from("categories")
    .select("id, slug");
  if (catFetchErr) throw catFetchErr;
  const catBySlug = Object.fromEntries(
    (catRows || []).map((c) => [c.slug, c.id]),
  );

  const teeSizeChart = [
    { size: "M", chest: "22", length: "28" },
    { size: "L", chest: "23", length: "29" },
    { size: "XL", chest: "24.5", length: "30" },
    { size: "2XL", chest: "26", length: "31" },
  ];

  // --- Products ---
  const products = [
    {
      title: "Shadow Drop Tee",
      slug: "shadow-drop-tee",
      original_price: 140,
      current_price: 120,
      status: "active",
      product_type: "tee",
      description: {
        html: "<p>Heavyweight 240 GSM oversized tee. Cut for riders, engineered for the road.</p>",
      },
      images: [
        productImages["shadow-drop-tee"],
        productImages["void-oversized"],
        productImages["bone-rider"],
      ],
      category: "black-collection",
      tag: "Bestseller",
      colors: ["Black", "Charcoal", "Bone"],
      size_chart: teeSizeChart,
    },
    {
      title: "Void Oversized",
      slug: "void-oversized",
      original_price: 150,
      current_price: 135,
      status: "active",
      product_type: "tee",
      description: {
        html: "<p>Boxy oversized silhouette in deep void black. Signature drop-shoulder cut.</p>",
      },
      images: [
        productImages["void-oversized"],
        productImages["shadow-drop-tee"],
        productImages["coral-signal"],
      ],
      category: "oversized-drop",
      tag: "New",
      colors: ["Black", "Grey"],
      size_chart: teeSizeChart,
    },
    {
      title: "Bone Rider",
      slug: "bone-rider",
      original_price: 140,
      current_price: 120,
      status: "active",
      product_type: "tee",
      description: {
        html: "<p>Bone-tone rider tee. Soft long-staple cotton with a structured drape.</p>",
      },
      images: [
        productImages["bone-rider"],
        productImages["shadow-drop-tee"],
        productImages["void-oversized"],
      ],
      category: "rider-essentials",
      tag: "Limited",
      colors: ["Bone", "Sand"],
      size_chart: teeSizeChart,
    },
    {
      title: "Coral Signal",
      slug: "coral-signal",
      original_price: 160,
      current_price: 140,
      status: "active",
      product_type: "tee",
      description: {
        html: "<p>Drop 04 coral signal tee. Stand out without saying a word.</p>",
      },
      images: [
        productImages["coral-signal"],
        productImages["bone-rider"],
        productImages["shadow-drop-tee"],
      ],
      category: "limited-edition",
      tag: "Drop 04",
      colors: ["Coral", "Black"],
      size_chart: teeSizeChart,
    },
  ];

  for (const p of products) {
    const payload = {
      title: p.title,
      slug: p.slug,
      original_price: p.original_price,
      current_price: p.current_price,
      status: p.status,
      product_type: p.product_type,
      description: p.description,
      size_chart: p.size_chart,
      updated_at: new Date().toISOString(),
    };

    let { data: prod, error } = await sb
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select("id")
      .single();

    if (error && /size_chart/i.test(error.message)) {
      const { size_chart: _sc, ...withoutChart } = payload;
      ({ data: prod, error } = await sb
        .from("products")
        .upsert(withoutChart, { onConflict: "slug" })
        .select("id")
        .single());
      console.warn(
        `product ${p.slug}: size_chart column missing — run migration 0010_product_size_chart.sql`,
      );
    }
    if (error) throw new Error(`product ${p.slug}: ${error.message}`);

    // Replace images (multi-image gallery)
    await sb.from("product_images").delete().eq("product_id", prod.id);
    const imageRows = p.images.map((path, i) => ({
      product_id: prod.id,
      path,
      alt: `${p.title} ${i + 1}`,
      is_main: i === 0,
      sort: i,
    }));
    const { error: imgErr } = await sb.from("product_images").insert(imageRows);
    if (imgErr) throw new Error(`product image ${p.slug}: ${imgErr.message}`);

    // Link category
    const catId = catBySlug[p.category];
    if (catId) {
      await sb.from("product_categories").delete().eq("product_id", prod.id);
      await sb
        .from("product_categories")
        .insert({ product_id: prod.id, category_id: catId });
    }

    // Variants
    await sb.from("product_variants").delete().eq("product_id", prod.id);
    const sizes = ["M", "L", "XL", "2XL"];
    const variants = [];
    for (const size of sizes) {
      for (const color of p.colors) {
        variants.push({
          product_id: prod.id,
          size,
          color,
          sku: `${p.slug.slice(0, 3).toUpperCase()}-${size}-${color.slice(0, 3).toUpperCase()}`,
          stock_quantity: size === "2XL" ? 3 : 18,
          low_stock_threshold: 5,
        });
      }
    }
    const { error: vErr } = await sb.from("product_variants").insert(variants);
    if (vErr) throw new Error(`variants ${p.slug}: ${vErr.message}`);
    console.log("seeded product", p.slug);
  }

  // --- Reviews ---
  const reviews = [
    {
      customer_name: "Arjun M.",
      body: "Heaviest tee I own. The drape is unreal — feels like $200+.",
      rating: 5,
      image_path: reviewImages[0],
      is_published: true,
    },
    {
      customer_name: "Kaira S.",
      body: "Cut like a dream on the bike. Zero ride-up, zero regret.",
      rating: 5,
      image_path: reviewImages[1],
      is_published: true,
    },
    {
      customer_name: "Devon P.",
      body: "This brand looks expensive. Because it is. Worth every rupee.",
      rating: 5,
      image_path: reviewImages[2],
      is_published: true,
    },
    {
      customer_name: "Rider Community",
      body: "Worn everywhere. Built different.",
      rating: 5,
      image_path: reviewImages[3],
      is_published: true,
    },
    {
      customer_name: "VE Crew",
      body: "Drop 04 hits different.",
      rating: 5,
      image_path: reviewImages[4],
      is_published: true,
    },
    {
      customer_name: "Street Unit",
      body: "Premium stitch, zero compromises.",
      rating: 5,
      image_path: reviewImages[5],
      is_published: true,
    },
  ];

  // Clear previous published reviews then insert (demo seed)
  await sb
    .from("reviews")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: revErr } = await sb.from("reviews").insert(reviews);
  if (revErr) throw new Error(`reviews: ${revErr.message}`);
  console.log("seeded reviews");

  // --- Promotion ---
  await sb
    .from("promotions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: promoErr } = await sb.from("promotions").insert({
    title: "Drop 04 · Live Now",
    description:
      "Heavyweight 240 GSM oversized streetwear. Cut for riders, engineered for the road.",
    image_path: "lovable/drop-04.jpg",
    discount_percent: 15,
    active: true,
  });
  if (promoErr) throw new Error(`promotion: ${promoErr.message}`);
  console.log("seeded promotion");

  // --- CMS tables (if migration applied) ---
  if (await tableExists("banners")) {
    await sb
      .from("banners")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await sb.from("banners").insert({
      title: "NOT JUST RIDE. RIDE WITH STYLE.",
      subtitle: "Drop 04 · Live Now",
      image_path: heroPath,
      mobile_image_path: heroPath,
      cta_label: "Shop Collection",
      cta_url: "/product",
      sort: 10,
      active: true,
    });
    if (error) throw new Error(`banner: ${error.message}`);
    console.log("seeded banner");
  } else {
    console.warn(
      "SKIP banners — run backend/supabase/migrations/0006_cms.sql in Supabase SQL Editor, then re-run this script.",
    );
  }

  if (await tableExists("homepage_sections")) {
    await sb
      .from("homepage_sections")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await sb.from("homepage_sections").insert([
      {
        type: "hero",
        title: null,
        subtitle: null,
        sort: 10,
        active: true,
        config: {},
      },
      {
        type: "featured",
        title: "Built different.",
        subtitle: "Worn everywhere.",
        sort: 20,
        active: true,
        config: { limit: 4 },
      },
      {
        type: "categories",
        title: "Editorial chapters",
        subtitle: "Engineered to ride.",
        sort: 30,
        active: true,
        config: {},
      },
      {
        type: "richtext",
        title: "Every thread engineered.",
        subtitle: "Material Study",
        body: "Cut from long-staple cotton and hand-checked for weight, drape, and finish. This isn't fast fashion — it's the last tee you'll buy this year.",
        sort: 40,
        active: true,
        config: { variant: "fabric" },
      },
      {
        type: "reviews",
        title: "Worn by the riders.",
        subtitle: "Community",
        sort: 50,
        active: true,
        config: {},
      },
      {
        type: "promo",
        title: "Get the next drop first.",
        subtitle: "Newsletter",
        sort: 60,
        active: true,
        config: {},
      },
    ]);
    if (error) throw new Error(`homepage_sections: ${error.message}`);
    console.log("seeded homepage_sections");
  } else {
    console.warn("SKIP homepage_sections — apply 0006_cms.sql first.");
  }

  // Archive leftover demo catalog so storefront matches Lovable only
  await sb
    .from("products")
    .update({ status: "archived" })
    .in("slug", ["core-training-tee", "all-day-hoodie"]);
  const { data: oldCats } = await sb
    .from("categories")
    .select("id")
    .in("slug", ["apparel", "accessories", "footwear"]);
  if (oldCats?.length) {
    const ids = oldCats.map((c) => c.id);
    await sb.from("product_categories").delete().in("category_id", ids);
    await sb.from("categories").delete().in("id", ids);
  }

  console.log(
    "\nDone. Lovable mock data is in Supabase Storage + catalog tables.",
  );
  console.log(
    "If banners/homepage_sections were skipped, run backend/supabase/migrations/0006_cms.sql in the Supabase SQL Editor, then re-run this script.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
