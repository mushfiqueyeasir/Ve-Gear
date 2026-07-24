"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/admin/format";
import type { UserRole } from "@/type/db";
import { deleteUser } from "./actions";
import { EditUserDialog } from "./EditUserDialog";

export interface UserTableRow {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

const ROLE_VARIANT: Record<UserRole, "default" | "info" | "secondary"> = {
  admin: "default",
  editor: "info",
  viewer: "secondary",
};

export function UsersTable({
  data,
  currentUserId,
}: {
  data: UserTableRow[];
  currentUserId: string;
}) {
  const [, setTick] = useState(0);

  return (
    <AdminList
      items={data}
      searchPlaceholder="Search by email…"
      searchFilter={(item, q) =>
        item.email.toLowerCase().includes(q) ||
        (item.full_name ?? "").toLowerCase().includes(q)
      }
      emptyMessage="No users found."
      renderTitle={(item) => (
        <>
          {item.email}
          {item.id === currentUserId ? (
            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
          ) : null}
        </>
      )}
      renderSubtitle={(item) =>
        `${item.full_name || "—"} · Joined ${formatDate(item.created_at)}`
      }
      renderTrailing={(item) => {
        const isSelf = item.id === currentUserId;
        return (
          <>
            <Badge variant={ROLE_VARIANT[item.role]} className="capitalize">
              {item.role}
            </Badge>
            <EditUserDialog user={item} isSelf={isSelf} />
            {!isSelf ? (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-destructive"
                    aria-label="Delete user"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
                title="Delete user"
                description={`Permanently delete ${item.email}? This cannot be undone.`}
                confirmLabel="Delete"
                action={() => deleteUser(item.id)}
                onDone={() => setTick((t) => t + 1)}
              />
            ) : null}
          </>
        );
      }}
    />
  );
}
