import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { AboutTable } from "./AboutTable";
import { listAboutSections } from "./actions";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);
  const sections = await listAboutSections();

  return (
    <div>
      <PageHeader
        title="About page"
        description="Control every About Us block — copy, images, and section order."
      />
      <AboutTable data={sections} canWrite={writable} />
    </div>
  );
}
