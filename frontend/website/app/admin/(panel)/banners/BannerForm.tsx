"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { BannerRow } from "@/type/db";
import { BUCKETS } from "@/lib/supabase/config";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  FormActions,
  FormField,
  adminInputClass,
} from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveBanner } from "./actions";

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function BannerForm({
  banner,
  returnTo = "/admin/homepage",
}: {
  banner?: BannerRow;
  returnTo?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.cta_label ?? "");
  const [ctaUrl, setCtaUrl] = useState(banner?.cta_url ?? "");
  const [active, setActive] = useState(banner?.active ?? true);
  const [startsAt, setStartsAt] = useState(
    isoToLocalInput(banner?.starts_at ?? null),
  );
  const [endsAt, setEndsAt] = useState(isoToLocalInput(banner?.ends_at ?? null));
  const [images, setImages] = useState<UploadedImage[]>(
    banner?.image_path ? [{ path: banner.image_path }] : [],
  );
  const [mobileImages, setMobileImages] = useState<UploadedImage[]>(
    banner?.mobile_image_path ? [{ path: banner.mobile_image_path }] : [],
  );

  const submit = () => {
    if (!title.trim()) {
      toast.error("A headline is required.");
      return;
    }
    if (!images[0]?.path) {
      toast.error("A banner image is required.");
      return;
    }
    startTransition(async () => {
      const res = await saveBanner({
        id: banner?.id,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        image_path: images[0]?.path ?? null,
        mobile_image_path: mobileImages[0]?.path ?? null,
        cta_label: ctaLabel.trim() || null,
        cta_url: ctaUrl.trim() || null,
        active,
        starts_at: localInputToIso(startsAt),
        ends_at: localInputToIso(endsAt),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(banner ? "Banner updated" : "Banner created");
      router.push(returnTo);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <AdminCard
            title="Content"
            description="Headline, subtitle, and call-to-action."
          >
            <div className="space-y-5">
              <FormField
                label="Headline"
                htmlFor="title"
                hint="Required — shown as the main banner title."
              >
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="NOT JUST RIDE. RIDE WITH STYLE."
                  required
                  className={adminInputClass}
                />
              </FormField>
              <FormField label="Eyebrow / subtitle" htmlFor="subtitle">
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Fresh drops"
                  className={adminInputClass}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Button label" htmlFor="cta_label">
                  <Input
                    id="cta_label"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Shop now"
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Button link" htmlFor="cta_url">
                  <Input
                    id="cta_url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/product"
                    className={adminInputClass}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Starts at" htmlFor="starts_at">
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Ends at" htmlFor="ends_at">
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className={adminInputClass}
                  />
                </FormField>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <AdminCard
              title="Desktop image"
              description="Wide image for tablet & desktop."
            >
              <ImageUploader
                bucket={BUCKETS.banner}
                value={images}
                onChange={setImages}
                label="Upload desktop image"
              />
            </AdminCard>
            <AdminCard
              title="Mobile image"
              description="Optional taller crop for phones."
            >
              <ImageUploader
                bucket={BUCKETS.banner}
                value={mobileImages}
                onChange={setMobileImages}
                label="Upload mobile image"
              />
            </AdminCard>
          </div>
        </div>

        <div className="space-y-5">
          <AdminCard title="Visibility">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Show in the homepage banner
                </p>
              </div>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>
          </AdminCard>

        </div>
      </div>

      <FormActions>
        <Button
          variant="outline"
          onClick={() => router.push(returnTo)}
          disabled={pending}
          className="rounded-full px-6"
        >
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={pending}
          className="rounded-full px-6"
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {banner ? "Save changes" : "Create banner"}
        </Button>
      </FormActions>
    </div>
  );
}
