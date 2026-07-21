import { requireRole } from "@/lib/admin/auth";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { BannerForm } from "../../../banners/BannerForm";
import { listSections } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewHomepageBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { section: sectionParam } = await searchParams;
  const sections = await listSections();
  const bannerSection =
    sections.find((s) => s.id === sectionParam && s.type === "banner") ??
    sections.find((s) => s.type === "banner");
  const returnTo = bannerSection
    ? `/admin/homepage/${bannerSection.id}?tab=slides`
    : "/admin/homepage";

  return (
    <div>
      <BackLink href={returnTo} label="Back to banner" />
      <PageHeader
        title="New banner slide"
        description="Add an image slide for the homepage Banner section."
      />
      <BannerForm returnTo={returnTo} />
    </div>
  );
}
