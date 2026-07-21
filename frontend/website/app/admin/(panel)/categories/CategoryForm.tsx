"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/admin/ImageUploader";
import { AdminCard } from "@/components/admin/AdminCard";
import {
  FormActions,
  FormField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BUCKETS } from "@/lib/supabase/config";
import { slugify } from "@/lib/admin/format";
import type { CategoryRow } from "@/type/db";
import { saveCategory } from "./actions";

export function CategoryForm({ category }: { category?: CategoryRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState<UploadedImage[]>(
    category?.image_path ? [{ path: category.image_path }] : [],
  );

  const onNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    startTransition(async () => {
      const res = await saveCategory({
        id: category?.id,
        name,
        slug: slug.trim() || slugify(name),
        description,
        image_path: image[0]?.path ?? null,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(category ? "Category updated" : "Category created");
      router.push("/admin/categories");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <AdminCard
        title="Category"
        description="Name, slug, and storefront image."
      >
        <div className="space-y-5">
          <FormField label="Name" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Helmets"
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
              placeholder="helmets"
              className={adminInputClass}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            hint="Optional description shown on the storefront."
          >
            <Textarea
              id="description"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short category blurb…"
              className={adminTextareaClass}
            />
          </FormField>

          <FormField label="Image">
            <ImageUploader
              bucket={BUCKETS.category}
              value={image}
              onChange={setImage}
              label="Upload category image"
              preview="cover"
            />
          </FormField>
        </div>
      </AdminCard>

      <FormActions>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/categories")}
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
          {category ? "Save changes" : "Create category"}
        </Button>
      </FormActions>
    </div>
  );
}
