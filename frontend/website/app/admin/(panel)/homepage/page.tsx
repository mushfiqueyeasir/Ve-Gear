import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { HomepageWorkspace } from "./HomepageWorkspace";
import { listSections } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);
  const sections = await listSections();

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Control every homepage block — layout, copy, and banner content."
      />
      <HomepageWorkspace sections={sections} canWrite={writable} />
    </div>
  );
}
