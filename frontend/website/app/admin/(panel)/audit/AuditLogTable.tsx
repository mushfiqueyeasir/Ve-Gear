"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AdminList } from "@/components/admin/AdminList";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/admin/format";
import type { AuditLogRow } from "@/type/db";
import { cn } from "@/lib/utils";

const ACTION_VARIANT: Record<
  string,
  "default" | "info" | "secondary" | "destructive" | "warning" | "success"
> = {
  create: "success",
  update: "info",
  delete: "destructive",
  reorder: "secondary",
  toggle: "warning",
  status_change: "default",
  login: "success",
  logout: "secondary",
  login_failed: "destructive",
};

function labelize(value: string) {
  return value.replace(/_/g, " ");
}

export function AuditLogTable({ data }: { data: AuditLogRow[] }) {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const entities = useMemo(
    () =>
      [...new Set(data.map((row) => row.entity))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  );
  const actions = useMemo(
    () =>
      [...new Set(data.map((row) => row.action))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  );

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (entityFilter !== "all" && row.entity !== entityFilter) return false;
      if (actionFilter !== "all" && row.action !== actionFilter) return false;
      return true;
    });
  }, [data, entityFilter, actionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="h-10 w-[11rem] rounded-full">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {entities.map((entity) => (
              <SelectItem key={entity} value={entity} className="capitalize">
                {labelize(entity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-10 w-[11rem] rounded-full">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action} className="capitalize">
                {labelize(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdminList
        items={filtered}
        searchPlaceholder="Search summary, actor, entity…"
        searchFilter={(item, q) => {
          const hay = [
            item.summary,
            item.actor_email ?? "",
            item.entity,
            item.action,
            item.entity_id ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        }}
        emptyMessage="No audit events yet."
        renderTitle={(item) => item.summary}
        renderSubtitle={(item) => {
          const actor = item.actor_email
            ? `${item.actor_email}${item.actor_role ? ` · ${item.actor_role}` : ""}`
            : "Storefront / system";
          return `${formatDateTime(item.created_at)} · ${actor}`;
        }}
        renderMeta={(item) => (
          <>
            <Badge
              variant={ACTION_VARIANT[item.action] ?? "secondary"}
              className="capitalize"
            >
              {labelize(item.action)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {labelize(item.entity)}
            </Badge>
          </>
        )}
        renderTrailing={(item) => {
          const hasMeta =
            item.metadata &&
            typeof item.metadata === "object" &&
            Object.keys(item.metadata).length > 0;
          if (!hasMeta) return null;
          const open = expandedId === item.id;
          return (
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Hide details" : "Show details"}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground",
              )}
              onClick={() => setExpandedId(open ? null : item.id)}
            >
              {open ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          );
        }}
      />

      {expandedId ? (
        <ExpandedMeta
          row={filtered.find((r) => r.id === expandedId) ?? null}
          onClose={() => setExpandedId(null)}
        />
      ) : null}
    </div>
  );
}

function ExpandedMeta({
  row,
  onClose,
}: {
  row: AuditLogRow | null;
  onClose: () => void;
}) {
  if (!row) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Event details</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Close
        </button>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{row.summary}</p>
      <pre className="overflow-x-auto rounded-xl bg-surface p-3 text-xs text-foreground/90">
        {JSON.stringify(
          {
            entity_id: row.entity_id,
            metadata: row.metadata,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
