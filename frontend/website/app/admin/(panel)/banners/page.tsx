import { redirect } from "next/navigation";
import { listSections } from "../homepage/actions";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const sections = await listSections();
  const banner = sections.find((s) => s.type === "banner");
  redirect(
    banner ? `/admin/homepage/${banner.id}?tab=slides` : "/admin/homepage",
  );
}
