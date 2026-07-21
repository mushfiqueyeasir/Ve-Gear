/**
 * Seed CMS (banners, homepage sections, pages) into site_settings.socials._cms
 * plus extra mock orders / contact messages for the admin panel.
 *
 * Usage: node scripts/seed-cms.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, ".env"), "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

const env = loadEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const now = new Date().toISOString();

async function main() {
  const { data: settings, error: sErr } = await sb
    .from("site_settings")
    .select("socials")
    .eq("id", 1)
    .maybeSingle();
  if (sErr) throw sErr;

  const socials = { ...(settings?.socials || {}) };
  // Keep real social links; strip nested cms key for rewrite
  const publicSocials = Object.fromEntries(
    Object.entries(socials).filter(([k]) => !k.startsWith("_")),
  );

  const cms = {
    announcement: {
      text: "DROP 04 · LIVE NOW — Free shipping over $100",
      active: false,
      url: "/product",
    },
    banners: [
      {
        id: randomUUID(),
        title: "NOT JUST RIDE. RIDE WITH STYLE.",
        subtitle: "Drop 04 · Live Now",
        image_path: "lovable/hero-biker.jpg",
        mobile_image_path: "lovable/hero-biker.jpg",
        cta_label: "Shop Collection",
        cta_url: "/product",
        sort: 10,
        active: true,
        starts_at: null,
        ends_at: null,
        created_at: now,
        updated_at: now,
      },
    ],
    homepage_sections: [
      {
        id: randomUUID(),
        type: "hero",
        title: null,
        subtitle: null,
        body: null,
        sort: 10,
        active: true,
        config: {},
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: "featured",
        title: "Built different.",
        subtitle: "Worn everywhere.",
        body: null,
        sort: 20,
        active: true,
        config: { limit: 4 },
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: "categories",
        title: "Editorial chapters",
        subtitle: "Engineered to ride.",
        body: null,
        sort: 30,
        active: true,
        config: {},
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: "richtext",
        title: "Every thread engineered.",
        subtitle: "Material Study",
        body: "<p>Cut from long-staple cotton and hand-checked for weight, drape, and finish. This isn't fast fashion — it's the last tee you'll buy this year.</p>",
        sort: 40,
        active: true,
        config: { variant: "fabric" },
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: "reviews",
        title: "Worn by the riders.",
        subtitle: "Community",
        body: null,
        sort: 50,
        active: true,
        config: {},
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        type: "promo",
        title: "Drop 04 is live",
        subtitle: "Limited",
        body: null,
        sort: 60,
        active: true,
        config: {},
        created_at: now,
        updated_at: now,
      },
    ],
    seo: {
      title: "VE Gear – Premium Gear & Essentials",
      description:
        "Shop premium gear and everyday essentials at VE Gear. Thoughtfully designed, high-quality pieces built to move with you.",
      keywords:
        "VE Gear, Premium Gear, Streetwear, Oversized Tee, Rider Essentials, Online Store",
      og_image_path: null,
    },
    pages: {
      about: {
        slug: "about",
        title: "About VE Gear",
        body_html:
          "<p>VE Gear was built for riders who want premium streetwear that performs.</p><h2>Our mission</h2><p>Heavyweight cotton. Oversized cuts. Engineered for the road — worn well past the ride home.</p><h2>Community</h2><p>When you choose VE Gear, you join a community that values quality, design, and authenticity.</p>",
        updated_at: now,
      },
      terms: {
        slug: "terms",
        title: "Terms of Service",
        body_html:
          "<p>By using VE Gear you agree to these terms.</p><h2>Orders</h2><p>All orders are subject to availability and confirmation of payment on delivery.</p><h2>Contact</h2><p>Email hello@vegear.com for questions.</p>",
        updated_at: now,
      },
      privacy: {
        slug: "privacy",
        title: "Privacy Policy",
        body_html:
          "<p>We collect only what we need to fulfill orders and improve the store.</p><h2>Data we collect</h2><p>Name, phone, address, and order details for delivery.</p><h2>Requests</h2><p>Email hello@vegear.com for privacy requests.</p>",
        updated_at: now,
      },
      refund: {
        slug: "refund",
        title: "Shipping & Return Policy",
        body_html:
          "<h2>Shipping</h2><p>We ship via Pathao Courier across Bangladesh.</p><ul><li>Inside Dhaka: ৳80</li><li>Outside Dhaka: ৳130</li></ul><h2>Returns</h2><p>Unused items with tags can be returned within 7 days of delivery.</p>",
        updated_at: now,
      },
    },
  };

  const { error: upErr } = await sb
    .from("site_settings")
    .update({
      socials: { ...publicSocials, _cms: cms },
      store_name: "VE Gear",
      updated_at: now,
    })
    .eq("id", 1);
  if (upErr) throw upErr;
  console.log("seeded CMS blob into site_settings.socials._cms");

  // Contact messages
  await sb.from("contact_submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: cErr } = await sb.from("contact_submissions").insert([
    {
      name: "Amina Rahman",
      email: "amina@example.com",
      phone: "+8801700000001",
      message: "Do you restock Void Oversized in XL?",
      is_read: false,
    },
    {
      name: "Karim H.",
      email: "karim@example.com",
      phone: "+8801700000002",
      message: "Love Drop 04 — shipping to Chittagong?",
      is_read: true,
    },
    {
      name: "Nadia",
      email: "nadia@example.com",
      message: "Size guide for oversized tees please.",
      is_read: false,
    },
  ]);
  if (cErr) console.warn("contact seed:", cErr.message);
  else console.log("seeded contact_submissions");

  // Mock orders using existing products
  const { data: products } = await sb
    .from("products")
    .select("id, title, current_price, slug")
    .eq("status", "active")
    .limit(4);

  if (products?.length) {
    const { data: existing } = await sb.from("orders").select("id").limit(50);
    if ((existing || []).length < 3) {
      for (let i = 0; i < 3; i++) {
        const p = products[i % products.length];
        const qty = i + 1;
        const subtotal = Number(p.current_price) * qty;
        const shipping = i === 0 ? 80 : 130;
        const { data: order, error: oErr } = await sb
          .from("orders")
          .insert({
            status: ["pending", "confirmed", "shipped"][i],
            delivery: {
              firstName: ["Amina", "Karim", "Nadia"][i],
              lastName: ["R.", "H.", "S."][i],
              address: "House 12, Road 4",
              city: i === 2 ? "Chittagong" : "Dhaka",
              phone: `+88017000000${i}`,
              country: "Bangladesh",
            },
            totals: {
              subtotal,
              shipping,
              total: subtotal + shipping,
            },
            payment_method: "cod",
          })
          .select("id")
          .single();
        if (oErr) {
          console.warn("order seed:", oErr.message);
          continue;
        }
        const { error: iErr } = await sb.from("order_items").insert({
          order_id: order.id,
          product_id: p.id,
          title: p.title,
          size: ["M", "L", "XL"][i],
          quantity: qty,
          unit_price: Number(p.current_price),
        });
        if (iErr) console.warn("order_items seed:", iErr.message);
      }
      console.log("seeded sample orders");
    } else {
      console.log("orders already present — skipped");
    }
  }

  console.log("\nDone. Open /admin/banners, /admin/homepage, /admin/pages");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
