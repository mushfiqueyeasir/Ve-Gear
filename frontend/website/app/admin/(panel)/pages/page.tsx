import Link from "next/link";
import { requireAdminSession, canWrite } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";
import { listPages } from "./actions";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  refund: "Shipping & Returns",
};

export default async function PagesAdminPage() {
  const session = await requireAdminSession();
  const writable = canWrite(session.role);
  const pages = (await listPages()).filter((p) => p.slug !== "about");

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Edit Terms, Privacy, and Returns. About Us sections are managed under Content → About."
      />
      <div className="mb-4">
        <AdminCard
          title="About Us"
          description="Hero, story, values, craft, and CTA"
          action={
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <Link href="/admin/about">Manage sections</Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Same workflow as Homepage — drag to reorder and edit each block.
          </p>
        </AdminCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => (
          <AdminCard
            key={page.slug}
            title={LABELS[page.slug] || page.title}
            description={page.title}
            action={
              writable ? (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                >
                  <Link href={`/admin/pages/${page.slug}`}>Edit</Link>
                </Button>
              ) : null
            }
          >
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {page.body_html.replace(/<[^>]+>/g, " ").trim() ||
                "No content yet."}
            </p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
