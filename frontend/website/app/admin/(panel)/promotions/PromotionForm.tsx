"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { PromotionRow } from "@/type/db";
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
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePromotion } from "./actions";

export type ProductOption = { id: string; title: string; slug: string };

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

function productPath(slug: string) {
  return `/product/${slug}`;
}

function matchProductId(
  products: ProductOption[],
  ctaUrl: string | null | undefined,
): string {
  if (!ctaUrl?.trim()) return products[0]?.id ?? "";
  const normalized = ctaUrl.trim().replace(/\/+$/, "");
  const match = products.find((p) => productPath(p.slug) === normalized);
  return match?.id ?? products[0]?.id ?? "";
}

export function PromotionForm({
  promotion,
  products = [],
}: {
  promotion?: PromotionRow;
  products?: ProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(promotion?.title ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [discount, setDiscount] = useState(
    promotion?.discount_percent != null
      ? String(promotion.discount_percent)
      : "",
  );
  const [active, setActive] = useState(promotion?.active ?? true);
  const [startsAt, setStartsAt] = useState(
    isoToLocalInput(promotion?.starts_at ?? null),
  );
  const [endsAt, setEndsAt] = useState(
    isoToLocalInput(promotion?.ends_at ?? null),
  );
  const [images, setImages] = useState<UploadedImage[]>(
    promotion?.image_path ? [{ path: promotion.image_path }] : [],
  );
  const [ctaLabel, setCtaLabel] = useState(promotion?.cta_label ?? "Shop Now");
  const [productId, setProductId] = useState(() =>
    matchProductId(products, promotion?.cta_url),
  );

  const resolvedCtaUrl = useMemo(() => {
    const product = products.find((p) => p.id === productId);
    return product ? productPath(product.slug) : null;
  }, [productId, products]);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!productId || !resolvedCtaUrl) {
      toast.error("Select a product for the promo link.");
      return;
    }
    const discountNum = discount.trim() === "" ? null : Number(discount);
    if (discountNum != null && (Number.isNaN(discountNum) || discountNum < 0)) {
      toast.error("Discount must be a positive number.");
      return;
    }

    startTransition(async () => {
      const res = await savePromotion({
        id: promotion?.id,
        title: title.trim(),
        description: description.trim() || null,
        image_path: images[0]?.path ?? null,
        discount_percent: discountNum,
        cta_url: resolvedCtaUrl,
        cta_label: ctaLabel.trim() || null,
        active,
        starts_at: localInputToIso(startsAt),
        ends_at: localInputToIso(endsAt),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(promotion ? "Promotion updated" : "Promotion created");
      router.push("/admin/promotions");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <AdminCard
            title="Promotion"
            description="Title, copy, discount, link, and schedule."
          >
            <div className="space-y-5">
              <FormField label="Title" htmlFor="title">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summer Sale"
                  className={adminInputClass}
                />
              </FormField>
              <FormField label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe this promotion…"
                  className={adminTextareaClass}
                />
              </FormField>
              <FormField label="Discount percent" htmlFor="discount">
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="e.g. 20"
                  className={adminInputClass}
                />
              </FormField>

              <FormField
                label="Product"
                hint="Shop Now on the promo popup opens this product page."
              >
                <Select
                  value={productId || undefined}
                  onValueChange={setProductId}
                  disabled={products.length === 0}
                >
                  <SelectTrigger className={adminSelectClass}>
                    <SelectValue
                      placeholder={
                        products.length === 0
                          ? "No active products"
                          : "Select a product"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Button label" htmlFor="cta_label">
                <Input
                  id="cta_label"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Shop Now"
                  className={adminInputClass}
                />
              </FormField>

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
        </div>

        <div className="space-y-5">
          <AdminCard title="Banner image">
            <ImageUploader
              bucket={BUCKETS.promotion}
              value={images}
              onChange={setImages}
              label="Upload banner"
            />
          </AdminCard>

          <AdminCard title="Visibility">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Show on the storefront
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
          onClick={() => router.push("/admin/promotions")}
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
          {promotion ? "Save changes" : "Create promotion"}
        </Button>
      </FormActions>
    </div>
  );
}
