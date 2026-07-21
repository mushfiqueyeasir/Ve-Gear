"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import {
  FormActions,
  FormField,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/FormField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUCKETS } from "@/lib/supabase/config";
import { slugify } from "@/lib/admin/format";
import { DEFAULT_TEE_SIZE_CHART } from "@/lib/products/sizeChart";
import { saveProduct, type ProductVariantInput } from "./actions";

export interface SizeChartFormRow {
  size: string;
  chest: string;
  length: string;
}

export interface ProductFormData {
  id?: string;
  title: string;
  slug: string;
  status: "active" | "draft" | "archived";
  product_type: string | null;
  original_price: number;
  current_price: number;
  description: { html?: string } | null;
  size_chart?: SizeChartFormRow[];
  categoryIds: string[];
  images: UploadedImage[];
  variants: VariantRow[];
}

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price_override: string;
  stock_quantity: string;
  low_stock_threshold: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

const emptyVariant = (): VariantRow => ({
  size: "",
  color: "",
  sku: "",
  price_override: "",
  stock_quantity: "0",
  low_stock_threshold: "5",
});

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductFormData;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    product?.status ?? "active",
  );
  const [productType, setProductType] = useState(product?.product_type ?? "");
  const [originalPrice, setOriginalPrice] = useState(
    String(product?.original_price ?? 0),
  );
  const [currentPrice, setCurrentPrice] = useState(
    String(product?.current_price ?? 0),
  );
  const [description, setDescription] = useState(
    product?.description?.html ?? "",
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    product?.categoryIds ?? [],
  );
  const [images, setImages] = useState<UploadedImage[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.length ? product.variants : [emptyVariant()],
  );
  const [sizeChart, setSizeChart] = useState<SizeChartFormRow[]>(
    product?.size_chart?.length ? product.size_chart : [],
  );

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const updateVariant = (
    index: number,
    key: keyof VariantRow,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const updateSizeChart = (
    index: number,
    key: keyof SizeChartFormRow,
    value: string,
  ) => {
    setSizeChart((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  };
  const addSizeChartRow = () =>
    setSizeChart((prev) => [...prev, { size: "", chest: "", length: "" }]);
  const removeSizeChartRow = (index: number) =>
    setSizeChart((prev) => prev.filter((_, i) => i !== index));
  const loadDefaultSizeChart = () =>
    setSizeChart(DEFAULT_TEE_SIZE_CHART.map((r) => ({ ...r })));

  const submit = () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const cleanedVariants: ProductVariantInput[] = variants
      .filter(
        (v) =>
          v.size.trim() ||
          v.color.trim() ||
          v.sku.trim() ||
          v.stock_quantity !== "" ||
          v.price_override.trim(),
      )
      .map((v) => ({
        id: v.id,
        size: v.size.trim() || null,
        color: v.color.trim() || null,
        sku: v.sku.trim() || null,
        price_override: v.price_override.trim()
          ? Number(v.price_override)
          : null,
        stock_quantity: Number(v.stock_quantity) || 0,
        low_stock_threshold: Number(v.low_stock_threshold) || 0,
      }));

    const cleanedSizeChart = sizeChart
      .map((row) => ({
        size: row.size.trim(),
        chest: row.chest.trim(),
        length: row.length.trim(),
      }))
      .filter((row) => row.size && (row.chest || row.length));

    startTransition(async () => {
      const res = await saveProduct({
        id: product?.id,
        title,
        slug: slug.trim() || slugify(title),
        status,
        product_type: productType.trim() || null,
        original_price: Number(originalPrice) || 0,
        current_price: Number(currentPrice) || 0,
        description: description.trim() ? { html: description } : null,
        size_chart: cleanedSizeChart.length ? cleanedSizeChart : null,
        categoryIds,
        images,
        variants: cleanedVariants,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 flex h-auto w-fit flex-wrap justify-start gap-1 rounded-xl bg-card p-1">
          <TabsTrigger value="general" className="rounded-lg px-4">
            General
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg px-4">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="variations" className="rounded-lg px-4">
            Variations
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg px-4">
            Categories
          </TabsTrigger>
          <TabsTrigger value="images" className="rounded-lg px-4">
            Images
          </TabsTrigger>
          <TabsTrigger value="size-chart" className="rounded-lg px-4">
            Size chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Name, URL slug, and product story.
          </p>
          <FormField label="Title" htmlFor="title">
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Coral Signal Tee"
              className={adminInputClass}
            />
          </FormField>
          <FormField label="Slug" htmlFor="slug">
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={adminInputClass}
            />
          </FormField>
          <FormField label="Description">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe the product…"
            />
          </FormField>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Status, type, and storefront prices.
          </p>
          <FormField label="Status">
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as "active" | "draft" | "archived")
              }
            >
              <SelectTrigger className={adminSelectClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Product type" htmlFor="product_type">
            <Input
              id="product_type"
              value={productType ?? ""}
              onChange={(e) => setProductType(e.target.value)}
              placeholder="e.g. Tee"
              className={adminInputClass}
            />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Original price" htmlFor="original_price">
              <Input
                id="original_price"
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className={adminInputClass}
              />
            </FormField>
            <FormField label="Current price" htmlFor="current_price">
              <Input
                id="current_price"
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className={adminInputClass}
              />
            </FormField>
          </div>
        </TabsContent>

        <TabsContent value="variations" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Size / colour combinations with stock and SKU.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={addVariant}
            >
              <Plus className="size-4" /> Add row
            </Button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-12 sm:items-end"
              >
                <FormField label="Size" className="sm:col-span-2">
                  <Input
                    value={v.size}
                    onChange={(e) => updateVariant(i, "size", e.target.value)}
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Color" className="sm:col-span-2">
                  <Input
                    value={v.color}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="SKU" className="sm:col-span-3">
                  <Input
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Price override" className="sm:col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={v.price_override}
                    onChange={(e) =>
                      updateVariant(i, "price_override", e.target.value)
                    }
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Stock" className="sm:col-span-1">
                  <Input
                    type="number"
                    value={v.stock_quantity}
                    onChange={(e) =>
                      updateVariant(i, "stock_quantity", e.target.value)
                    }
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Low" className="sm:col-span-1">
                  <Input
                    type="number"
                    value={v.low_stock_threshold}
                    onChange={(e) =>
                      updateVariant(i, "low_stock_threshold", e.target.value)
                    }
                    className={adminInputClass}
                  />
                </FormField>
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => removeVariant(i)}
                    aria-label="Remove variation"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No variations. Add one to track stock.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Assign this product to one or more categories.
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories yet. Create one first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm normal-case tracking-normal text-foreground transition hover:border-primary/40"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={categoryIds.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Upload multiple photos for one product. Mark a main image with the
            star — the rest appear as gallery thumbnails on the product page.
          </p>
          <ImageUploader
            bucket={BUCKETS.product}
            value={images}
            onChange={setImages}
            multiple
            label="Upload product images"
          />
        </TabsContent>

        <TabsContent value="size-chart" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Optional. If you add rows, a size chart appears on the product
              page. Leave empty to hide it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={loadDefaultSizeChart}
              >
                Load tee defaults
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={addSizeChartRow}
              >
                <Plus className="size-4" /> Add row
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {sizeChart.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-12 sm:items-end"
              >
                <FormField label="Size" className="sm:col-span-3">
                  <Input
                    value={row.size}
                    onChange={(e) => updateSizeChart(i, "size", e.target.value)}
                    placeholder="M"
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Chest (in)" className="sm:col-span-4">
                  <Input
                    value={row.chest}
                    onChange={(e) =>
                      updateSizeChart(i, "chest", e.target.value)
                    }
                    placeholder="22"
                    className={adminInputClass}
                  />
                </FormField>
                <FormField label="Length (in)" className="sm:col-span-4">
                  <Input
                    value={row.length}
                    onChange={(e) =>
                      updateSizeChart(i, "length", e.target.value)
                    }
                    placeholder="28"
                    className={adminInputClass}
                  />
                </FormField>
                <div className="flex justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => removeSizeChartRow(i)}
                    aria-label="Remove size chart row"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {sizeChart.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No size chart. Customers won&apos;t see a guide on this product.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormActions>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
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
          {product ? "Save changes" : "Create product"}
        </Button>
      </FormActions>
    </div>
  );
}
