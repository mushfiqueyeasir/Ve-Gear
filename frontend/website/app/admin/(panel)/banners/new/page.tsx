import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewBannerPage() {
  redirect("/admin/homepage/banners/new");
}
