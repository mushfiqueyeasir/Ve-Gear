"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/admin/format";
import type { UserRole } from "@/type/db";
import { updateUserRole, deleteUser } from "./actions";

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

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

function RoleSelect({
  row,
  currentUserId,
}: {
  row: UserTableRow;
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const isSelf = row.id === currentUserId;

  const onChange = (value: string) => {
    const role = value as UserRole;
    if (role === row.role) return;
    startTransition(async () => {
      const res = await updateUserRole(row.id, role);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Role updated");
    });
  };

  if (isSelf) {
    return (
      <Badge variant={ROLE_VARIANT[row.role]} className="capitalize">
        {row.role}
      </Badge>
    );
  }

  return (
    <Select value={row.role} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-11 w-full min-w-28 rounded-full sm:h-9 sm:w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r} className="capitalize">
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
      renderTrailing={(item) => (
        <>
          <RoleSelect row={item} currentUserId={currentUserId} />
          {item.id !== currentUserId ? (
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
      )}
    />
  );
}
