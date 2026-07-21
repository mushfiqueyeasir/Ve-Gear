"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import {
  FormActions,
  FormField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/FormField";
import { BUCKETS } from "@/lib/supabase/config";
import type { SiteSettingsRow } from "@/type/db";
import type { CmsSeo } from "@/lib/cms/types";
import { DEFAULT_SEO } from "@/lib/cms/types";
import {
  SUPPORTED_CURRENCIES,
  normalizeCurrencySettings,
  type CurrencyCode,
  type CurrencySettings,
} from "@/lib/currency";
import {
  DEFAULT_DELIVERY_CHARGES,
  normalizeDeliveryCharges,
  type DeliveryCharges,
} from "@/lib/delivery";
import {
  chatMessengerHref,
  DEFAULT_CHAT_WIDGETS,
  normalizeChatWidgets,
  type ChatProvider,
  type ChatWidgets,
} from "@/lib/chatWidgets";
import {
  DEFAULT_PALETTE,
  PALETTE_FIELDS,
  PALETTE_PRESETS,
  normalizePalette,
  type ThemePalette,
} from "@/lib/theme/palette";
import { cn } from "@/lib/utils";
import { saveSettings, type SettingsInput } from "./actions";

function orNull(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

export function SettingsForm({
  settings,
  seo: initialSeo,
  currencies: initialCurrencies,
  deliveryCharges: initialDeliveryCharges,
  chatWidgets: initialChatWidgets,
  palette: initialPalette,
}: {
  settings: SiteSettingsRow;
  seo?: CmsSeo | null;
  currencies?: CurrencySettings | null;
  deliveryCharges?: DeliveryCharges | null;
  chatWidgets?: ChatWidgets | null;
  palette?: ThemePalette | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [storeName, setStoreName] = useState(settings.store_name ?? "");
  const [logo, setLogo] = useState<UploadedImage[]>(
    settings.logo_path ? [{ path: settings.logo_path }] : [],
  );
  const [favicon, setFavicon] = useState<UploadedImage[]>(
    settings.favicon_path ? [{ path: settings.favicon_path }] : [],
  );
  const [contactEmail, setContactEmail] = useState(
    settings.contact_email ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    settings.contact_phone ?? "",
  );
  const [address, setAddress] = useState(settings.address ?? "");

  const currencyState = normalizeCurrencySettings(
    initialCurrencies ?? {
      enabled: [settings.currency as CurrencyCode].filter(Boolean),
      default: (settings.currency as CurrencyCode) || "BDT",
    },
  );
  const [enabledCurrencies, setEnabledCurrencies] = useState<CurrencyCode[]>(
    currencyState.enabled,
  );
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(
    currencyState.default,
  );

  const deliveryState = normalizeDeliveryCharges(
    initialDeliveryCharges ?? DEFAULT_DELIVERY_CHARGES,
  );
  const [insideDhakaCharge, setInsideDhakaCharge] = useState(
    String(deliveryState.insideDhaka),
  );
  const [outsideDhakaCharge, setOutsideDhakaCharge] = useState(
    String(deliveryState.outsideDhaka),
  );

  const chatState = normalizeChatWidgets(
    initialChatWidgets ?? DEFAULT_CHAT_WIDGETS,
  );
  const [chatProvider, setChatProvider] = useState<ChatProvider>(
    chatState.provider,
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    chatState.whatsappNumber,
  );
  const [messengerPageId, setMessengerPageId] = useState(
    chatState.messengerPageId,
  );

  const socials = settings.socials ?? {};
  const [instagram, setInstagram] = useState(socials.instagram ?? "");
  const [twitter, setTwitter] = useState(socials.twitter ?? "");
  const [facebook, setFacebook] = useState(socials.facebook ?? "");

  const [gaId, setGaId] = useState(settings.google_analytics_id ?? "");
  const [pixelId, setPixelId] = useState(settings.meta_pixel_id ?? "");
  const [gtmId, setGtmId] = useState(settings.gtm_id ?? "");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    settings.analytics_enabled ?? false,
  );

  const seoDefaults = { ...DEFAULT_SEO, ...(initialSeo ?? {}) };
  const [seoTitle, setSeoTitle] = useState(seoDefaults.title);
  const [seoDescription, setSeoDescription] = useState(seoDefaults.description);
  const [seoKeywords, setSeoKeywords] = useState(seoDefaults.keywords);
  const [ogImage, setOgImage] = useState<UploadedImage[]>(
    seoDefaults.og_image_path ? [{ path: seoDefaults.og_image_path }] : [],
  );

  const [palette, setPalette] = useState<ThemePalette>(() =>
    normalizePalette(initialPalette ?? DEFAULT_PALETTE),
  );

  const setPaletteColor = (key: keyof ThemePalette, value: string) => {
    setPalette((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCurrency = (code: CurrencyCode, on: boolean) => {
    setEnabledCurrencies((prev) => {
      const next = on
        ? Array.from(new Set([...prev, code]))
        : prev.filter((c) => c !== code);
      if (!next.length) {
        toast.error("Keep at least one currency enabled.");
        return prev;
      }
      if (!next.includes(defaultCurrency)) {
        setDefaultCurrency(next[0]);
      }
      return next;
    });
  };

  const onSave = () => {
    if (!storeName.trim()) {
      toast.error("Store name is required.");
      return;
    }
    if (!seoTitle.trim() || !seoDescription.trim()) {
      toast.error("SEO title and description are required.");
      return;
    }
    if (!enabledCurrencies.length) {
      toast.error("Enable at least one currency.");
      return;
    }

    const nextSocials: Record<string, string> = {};
    if (facebook.trim()) nextSocials.facebook = facebook.trim();
    if (instagram.trim()) nextSocials.instagram = instagram.trim();
    if (twitter.trim()) nextSocials.twitter = twitter.trim();

    const currencies = normalizeCurrencySettings({
      enabled: enabledCurrencies,
      default: defaultCurrency,
    });

    const deliveryCharges = normalizeDeliveryCharges({
      insideDhaka: Number(insideDhakaCharge),
      outsideDhaka: Number(outsideDhakaCharge),
    });

    if (
      !Number.isFinite(Number(insideDhakaCharge)) ||
      Number(insideDhakaCharge) < 0 ||
      !Number.isFinite(Number(outsideDhakaCharge)) ||
      Number(outsideDhakaCharge) < 0
    ) {
      toast.error("Delivery charges must be valid numbers (0 or more).");
      return;
    }

    const chatWidgets = normalizeChatWidgets({
      provider: chatProvider,
      whatsappNumber,
      messengerPageId,
    });

    if (chatWidgets.provider === "whatsapp" && !chatWidgets.whatsappNumber) {
      toast.error("Enter a WhatsApp number with country code.");
      return;
    }
    if (
      chatWidgets.provider === "messenger" &&
      !chatMessengerHref(chatWidgets.messengerPageId)
    ) {
      toast.error(
        "Enter your Facebook Page ID or username (e.g. 378400148906020).",
      );
      return;
    }

    const input: SettingsInput = {
      store_name: storeName,
      logo_path: logo[0]?.path ?? null,
      favicon_path: favicon[0]?.path ?? null,
      contact_email: orNull(contactEmail),
      contact_phone: orNull(contactPhone),
      address: orNull(address),
      currencies,
      deliveryCharges,
      chatWidgets,
      palette: normalizePalette(palette),
      socials: nextSocials,
      google_analytics_id: orNull(gaId),
      meta_pixel_id: orNull(pixelId),
      gtm_id: orNull(gtmId),
      analytics_enabled: analyticsEnabled,
      security_enabled: false,
      announcement_text: null,
      announcement_active: false,
      announcement_url: null,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        og_image_path: ogImage[0]?.path ?? null,
      },
    };

    startTransition(async () => {
      const res = await saveSettings(input);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Settings saved");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="mb-6 flex h-auto w-fit flex-wrap justify-start gap-1 rounded-xl bg-card p-1">
          <TabsTrigger value="brand" className="rounded-lg px-3 sm:px-4">
            Brand
          </TabsTrigger>
          <TabsTrigger value="colors" className="rounded-lg px-3 sm:px-4">
            Colors
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg px-3 sm:px-4">
            Contact
          </TabsTrigger>
          <TabsTrigger value="currency" className="rounded-lg px-3 sm:px-4">
            Currency
          </TabsTrigger>
          <TabsTrigger value="delivery" className="rounded-lg px-3 sm:px-4">
            Delivery
          </TabsTrigger>
          <TabsTrigger value="chat" className="rounded-lg px-3 sm:px-4">
            Chat
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg px-3 sm:px-4">
            Social
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-3 sm:px-4">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg px-3 sm:px-4">
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-5">
          <FormField label="Store name">
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="VE Gear"
              className={adminInputClass}
            />
          </FormField>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <FormField label="Logo" className="min-w-0 flex-1">
              <ImageUploader
                bucket={BUCKETS.branding}
                value={logo}
                onChange={setLogo}
                label="Drop logo here or click to browse"
                enableCrop
                preview="wide"
              />
            </FormField>
            <FormField
              label="Favicon"
              hint="Square tab icon (PNG)."
              className="shrink-0"
            >
              <ImageUploader
                bucket={BUCKETS.branding}
                value={favicon}
                onChange={setFavicon}
                label="Add favicon"
                enableCrop
                preview="square"
              />
            </FormField>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            These colors drive the whole storefront — buttons, backgrounds,
            text, and borders. Admin stays on the default theme.
          </p>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PALETTE_PRESETS.map((preset) => {
                const active =
                  JSON.stringify(normalizePalette(palette)) ===
                  JSON.stringify(preset.palette);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPalette({ ...preset.palette })}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span
                      className="size-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.palette.primary }}
                    />
                    {preset.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPalette({ ...DEFAULT_PALETTE })}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                Reset default
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-border"
            style={{
              background: palette.background,
              color: palette.foreground,
              borderColor: palette.border,
            }}
          >
            <div
              className="border-b px-4 py-3 text-xs uppercase tracking-[0.18em]"
              style={{
                borderColor: palette.border,
                color: palette.mutedForeground,
              }}
            >
              Live preview
            </div>
            <div className="space-y-3 p-4">
              <div
                className="rounded-xl border p-4"
                style={{
                  background: palette.card,
                  borderColor: palette.border,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: palette.foreground }}
                >
                  Product card
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: palette.mutedForeground }}
                >
                  Supporting copy uses muted text.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      background: palette.primary,
                      color: palette.primaryForeground,
                    }}
                  >
                    Shop now
                  </span>
                  <span
                    className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: palette.border,
                      color: palette.foreground,
                      background: palette.surface,
                    }}
                  >
                    View details
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PALETTE_FIELDS.map((field) => (
              <FormField key={field.key} label={field.label} hint={field.hint}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={palette[field.key]}
                    onChange={(e) => setPaletteColor(field.key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                    aria-label={field.label}
                  />
                  <Input
                    value={palette[field.key]}
                    onChange={(e) => setPaletteColor(field.key, e.target.value)}
                    className={cn(adminInputClass, "font-mono uppercase")}
                    maxLength={7}
                    spellCheck={false}
                  />
                </div>
              </FormField>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email">
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hello@vegear.com"
                className={adminInputClass}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+880…"
                className={adminInputClass}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, country"
              rows={3}
              className={adminTextareaClass}
            />
          </FormField>
        </TabsContent>

        <TabsContent value="currency" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Enable the currencies you use locally. Pick one as the store default
            — prices display with that symbol.
          </p>
          <div className="space-y-3">
            {SUPPORTED_CURRENCIES.map((c) => {
              const enabled = enabledCurrencies.includes(c.code);
              const isDefault = defaultCurrency === c.code;
              return (
                <div
                  key={c.code}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
                    enabled
                      ? "border-border bg-card/60"
                      : "border-border/60 opacity-70",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-white/5 font-mono text-xs text-muted-foreground">
                      {c.flag}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {c.code}{" "}
                        <span className="text-muted-foreground">
                          ({c.symbol})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="radio"
                        name="default-currency"
                        checked={isDefault}
                        disabled={!enabled}
                        onChange={() => setDefaultCurrency(c.code)}
                        className="accent-primary"
                      />
                      Default
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {enabled ? "On" : "Off"}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(on) => toggleCurrency(c.code, on)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Active default:{" "}
            <span className="text-foreground">
              {defaultCurrency} ·{" "}
              {SUPPORTED_CURRENCIES.find((c) => c.code === defaultCurrency)
                ?.symbol ?? ""}
            </span>
          </p>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Cash on delivery charge per order. Customers pick Inside Dhaka or
            Outside Dhaka at checkout — the matching rate is added to the total.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Inside Dhaka"
              hint="Default 70 — applies to Dhaka city orders."
            >
              <Input
                type="number"
                min={0}
                step={1}
                value={insideDhakaCharge}
                onChange={(e) => setInsideDhakaCharge(e.target.value)}
                className={adminInputClass}
              />
            </FormField>
            <FormField
              label="Outside Dhaka"
              hint="Default 120 — applies outside Dhaka."
            >
              <Input
                type="number"
                min={0}
                step={1}
                value={outsideDhakaCharge}
                onChange={(e) => setOutsideDhakaCharge(e.target.value)}
                className={adminInputClass}
              />
            </FormField>
          </div>
          <p className="text-xs text-muted-foreground">
            Amounts use your store currency (
            <span className="text-foreground">{defaultCurrency}</span>
            ).
          </p>
        </TabsContent>

        <TabsContent value="chat" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Pick one chat option. Meta retired the on-site Messenger Chat Plugin
            — both options open their app or messenger.com in a new tab.
          </p>

          <div className="space-y-2">
            {(
              [
                {
                  value: "none" as const,
                  label: "Off",
                  hint: "Hide chat button",
                },
                {
                  value: "messenger" as const,
                  label: "Messenger",
                  hint: "Opens m.me — Messenger app or messenger.com",
                },
                {
                  value: "whatsapp" as const,
                  label: "WhatsApp",
                  hint: "Opens WhatsApp — cannot stay on the website",
                },
              ] as const
            ).map((option) => {
              const selected = chatProvider === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/60 hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name="chat-provider"
                    checked={selected}
                    onChange={() => setChatProvider(option.value)}
                    className="accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {chatProvider === "whatsapp" ? (
            <FormField
              label="WhatsApp number"
              hint="Country code + number, e.g. 8801712345678. Clicking opens WhatsApp."
            >
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="8801712345678"
                inputMode="tel"
                className={adminInputClass}
              />
            </FormField>
          ) : null}

          {chatProvider === "messenger" ? (
            <FormField
              label="Facebook Page ID or username"
              hint="Use your Page ID (e.g. 378400148906020) or username. You can also paste an m.me link."
            >
              <Input
                value={messengerPageId}
                onChange={(e) => setMessengerPageId(e.target.value)}
                placeholder="378400148906020"
                className={adminInputClass}
              />
            </FormField>
          ) : null}
        </TabsContent>

        <TabsContent value="social" className="space-y-5">
          <FormField label="Instagram">
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/…"
              className={adminInputClass}
            />
          </FormField>
          <FormField label="Twitter / X">
            <Input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/…"
              className={adminInputClass}
            />
          </FormField>
          <FormField label="Facebook">
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/…"
              className={adminInputClass}
            />
          </FormField>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Enable tracking</p>
              <p className="text-xs text-muted-foreground">
                Load analytics scripts on the storefront
              </p>
            </div>
            <Switch
              checked={analyticsEnabled}
              onCheckedChange={setAnalyticsEnabled}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Google Analytics">
              <Input
                value={gaId}
                onChange={(e) => setGaId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={adminInputClass}
              />
            </FormField>
            <FormField label="Meta Pixel">
              <Input
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="000000000000000"
                className={adminInputClass}
              />
            </FormField>
            <FormField label="Google Tag Manager">
              <Input
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXX"
                className={adminInputClass}
              />
            </FormField>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Default search / social metadata for the storefront homepage and
            site-wide fallbacks.
          </p>
          <FormField label="Meta title" hint="Keep under ~60 characters.">
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="VE Gear – Premium Gear & Essentials"
              className={adminInputClass}
              maxLength={80}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {seoTitle.length}/80
            </p>
          </FormField>
          <FormField
            label="Meta description"
            hint="Keep under ~160 characters."
          >
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={4}
              maxLength={200}
              placeholder="Short description for Google and social shares."
              className={adminTextareaClass}
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {seoDescription.length}/200
            </p>
          </FormField>
          <FormField
            label="Keywords"
            hint="Comma-separated phrases (e.g. VE Gear, streetwear, oversized tee)."
          >
            <Textarea
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              rows={3}
              placeholder="VE Gear, streetwear, rider essentials"
              className={adminTextareaClass}
            />
          </FormField>
          <FormField
            label="Open Graph image"
            hint="Shown when sharing on social. Recommended 1200×630."
          >
            <ImageUploader
              bucket={BUCKETS.branding}
              value={ogImage}
              onChange={setOgImage}
              label="Drop OG image here or click to browse"
            />
          </FormField>
        </TabsContent>
      </Tabs>

      <FormActions>
        <Button
          onClick={onSave}
          disabled={pending}
          className="rounded-full px-6"
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save changes
        </Button>
      </FormActions>
    </div>
  );
}
