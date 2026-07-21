"use client";

import { useState, useTransition } from "react";
import { Eye, Trash2, Mail, MailOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ContactSubmissionRow } from "@/type/db";
import { formatDateTime } from "@/lib/admin/format";
import { AdminList } from "@/components/admin/AdminList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleRead, deleteSubmission } from "./actions";

export function ContactTable({
  data,
  canWrite,
}: {
  data: ContactSubmissionRow[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ContactSubmissionRow | null>(null);
  const [pending, startTransition] = useTransition();

  const open = (row: ContactSubmissionRow) => {
    setSelected(row);
    if (canWrite && !row.is_read) {
      startTransition(async () => {
        const res = await toggleRead(row.id, true);
        if (!res?.error) {
          setSelected((cur) =>
            cur && cur.id === row.id ? { ...cur, is_read: true } : cur,
          );
          router.refresh();
        }
      });
    }
  };

  const handleToggleRead = () => {
    if (!selected) return;
    const next = !selected.is_read;
    startTransition(async () => {
      const res = await toggleRead(selected.id, next);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(next ? "Marked as read" : "Marked as unread");
      setSelected((cur) =>
        cur && cur.id === selected.id ? { ...cur, is_read: next } : cur,
      );
      router.refresh();
    });
  };

  return (
    <>
      <AdminList
        items={data}
        searchPlaceholder="Search by name…"
        searchFilter={(item, q) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q)
        }
        emptyMessage="No messages yet."
        renderTitle={(item) => item.name}
        renderSubtitle={(item) =>
          `${item.email}${item.phone ? ` · ${item.phone}` : ""} · ${formatDateTime(item.submitted_at)}`
        }
        renderMeta={(item) => (
          <>
            {item.is_read ? (
              <Badge variant="secondary">Read</Badge>
            ) : (
              <Badge variant="info">Unread</Badge>
            )}
            <span className="line-clamp-1 max-w-md text-xs text-muted-foreground">
              {item.message}
            </span>
          </>
        )}
        renderTrailing={(item) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => open(item)}
              aria-label="View message"
            >
              <Eye className="size-4" />
            </Button>
            {canWrite ? (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
                title="Delete submission?"
                description={`The message from "${item.name}" will be permanently removed.`}
                confirmLabel="Delete"
                action={() => deleteSubmission(item.id)}
              />
            ) : null}
          </>
        )}
      />

      <Dialog
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <DialogContent className="rounded-2xl border-border bg-card">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.email}
                  {selected.phone ? ` · ${selected.phone}` : ""} ·{" "}
                  {formatDateTime(selected.submitted_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm text-foreground">
                {selected.message}
              </div>

              <DialogFooter className="sm:justify-between">
                <div className="flex items-center gap-2">
                  {selected.is_read ? (
                    <Badge variant="secondary">Read</Badge>
                  ) : (
                    <Badge variant="info">Unread</Badge>
                  )}
                </div>
                {canWrite && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleToggleRead}
                      disabled={pending}
                      className="rounded-full"
                    >
                      {pending ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : selected.is_read ? (
                        <Mail className="mr-2 size-4" />
                      ) : (
                        <MailOpen className="mr-2 size-4" />
                      )}
                      {selected.is_read ? "Mark unread" : "Mark read"}
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="destructive" className="rounded-full">
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      }
                      title="Delete submission?"
                      description={`The message from "${selected.name}" will be permanently removed.`}
                      confirmLabel="Delete"
                      action={() => deleteSubmission(selected.id)}
                      onDone={() => {
                        setSelected(null);
                        router.refresh();
                      }}
                    />
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
