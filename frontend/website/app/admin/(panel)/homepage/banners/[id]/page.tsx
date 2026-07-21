import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { PageHeader, BackLink } from "@/components/admin/PageHeader";
import { BannerForm } from "../../../banners/BannerForm";
import { listBanners } from "../../../banners/actions";
import { listSections } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHomepageBannerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const { section: sectionParam } = await searchParams;
  const [banners, sections] = await Promise.all([
    listBanners(),
    listSections(),
  ]);
  const banner = banners.find((b) => b.id === id);
  if (!banner) notFound();

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
        title="Edit banner slide"
        description={banner.title || "Untitled slide"}
      />
      <BannerForm banner={banner} returnTo={returnTo} />
    </div>
  );
}
