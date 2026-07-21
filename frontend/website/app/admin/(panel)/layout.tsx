import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession, canWrite, isAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Server layout for the authenticated merchant panel. Loads the session/role
// (redirects to /admin/login if absent) and hands it to the client shell.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <AdminShell
      session={{
        role: session.role,
        email: session.email,
        fullName: session.fullName,
        canWrite: canWrite(session.role),
        isAdmin: isAdmin(session.role),
      }}
    >
      {children}
    </AdminShell>
  );
}
