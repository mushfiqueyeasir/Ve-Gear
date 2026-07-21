"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminListItem = { id: string };

function Grip({ active }: { active: boolean }) {
  if (!active) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground/35">
        <GripVertical className="size-4" />
      </span>
    );
  }
  return null;
}

function RowContent<T extends AdminListItem>({
  item,
  renderLeading,
  renderTitle,
  renderSubtitle,
  renderMeta,
  renderTrailing,
  leading,
}: {
  item: T;
  renderLeading?: (item: T) => ReactNode;
  renderTitle: (item: T) => ReactNode;
  renderSubtitle?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
  leading: ReactNode;
}) {
  return (
    <>
      {leading}
      {renderLeading ? (
        <div className="shrink-0">{renderLeading(item)}</div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">
          {renderTitle(item)}
        </div>
        {renderSubtitle ? (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {renderSubtitle(item)}
          </div>
        ) : null}
        {renderMeta ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {renderMeta(item)}
          </div>
        ) : null}
      </div>
      {renderTrailing ? (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {renderTrailing(item)}
        </div>
      ) : null}
    </>
  );
}

function SortableRow<T extends AdminListItem>({
  item,
  renderLeading,
  renderTitle,
  renderSubtitle,
  renderMeta,
  renderTrailing,
}: {
  item: T;
  renderLeading?: (item: T) => ReactNode;
  renderTitle: (item: T) => ReactNode;
  renderSubtitle?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-3 py-3 sm:px-4",
        isDragging && "z-10 border-primary/50 bg-card shadow-lg shadow-black/40",
      )}
    >
      <RowContent
        item={item}
        renderLeading={renderLeading}
        renderTitle={renderTitle}
        renderSubtitle={renderSubtitle}
        renderMeta={renderMeta}
        renderTrailing={renderTrailing}
        leading={
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-xl text-muted-foreground transition hover:bg-white/5 hover:text-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  );
}

function StaticRow<T extends AdminListItem>({
  item,
  renderLeading,
  renderTitle,
  renderSubtitle,
  renderMeta,
  renderTrailing,
}: {
  item: T;
  renderLeading?: (item: T) => ReactNode;
  renderTitle: (item: T) => ReactNode;
  renderSubtitle?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-3 py-3 sm:px-4">
      <RowContent
        item={item}
        renderLeading={renderLeading}
        renderTitle={renderTitle}
        renderSubtitle={renderSubtitle}
        renderMeta={renderMeta}
        renderTrailing={renderTrailing}
        leading={<Grip active={false} />}
      />
    </div>
  );
}

export function AdminList<T extends AdminListItem>({
  items,
  sortable = false,
  canReorder = false,
  onReorder,
  hint,
  emptyMessage = "Nothing here yet.",
  searchPlaceholder,
  searchFilter,
  toolbar,
  renderLeading,
  renderTitle,
  renderSubtitle,
  renderMeta,
  renderTrailing,
}: {
  items: T[];
  sortable?: boolean;
  canReorder?: boolean;
  onReorder?: (orderedIds: string[]) => Promise<{ error?: string } | void>;
  hint?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  toolbar?: ReactNode;
  renderLeading?: (item: T) => ReactNode;
  renderTitle: (item: T) => ReactNode;
  renderSubtitle?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  renderTrailing?: (item: T) => ReactNode;
}) {
  const [rows, setRows] = useState(items);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const enableDrag = Boolean(sortable && canReorder && onReorder);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchFilter) return rows;
    return rows.filter((item) => searchFilter(item, q));
  }, [rows, query, searchFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    if (!enableDrag || !onReorder) return;
    if (query.trim()) {
      toast.error("Clear search before reordering.");
      return;
    }
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((i) => i.id === active.id);
    const newIndex = rows.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = rows;
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next);

    startTransition(async () => {
      const res = await onReorder(next.map((i) => i.id));
      if (res?.error) {
        setRows(previous);
        toast.error(res.error);
        return;
      }
      toast.success("Order updated");
    });
  };

  const rowProps = {
    renderLeading,
    renderTitle,
    renderSubtitle,
    renderMeta,
    renderTrailing,
  };

  const listBody =
    filtered.length === 0 ? (
      <p className="rounded-2xl border border-border bg-card/80 px-4 py-10 text-center text-sm text-muted-foreground">
        {rows.length === 0 ? emptyMessage : "No matches for your search."}
      </p>
    ) : (
      <div className="space-y-2">
        {filtered.map((item) =>
          enableDrag ? (
            <SortableRow key={item.id} item={item} {...rowProps} />
          ) : (
            <StaticRow key={item.id} item={item} {...rowProps} />
          ),
        )}
      </div>
    );

  return (
    <div className="space-y-3">
      {(searchPlaceholder || toolbar || (enableDrag && hint)) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            {enableDrag && hint ? (
              <p className="text-sm text-muted-foreground">{hint}</p>
            ) : null}
            {searchPlaceholder ? (
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-10 rounded-full border-border bg-card/60 pl-9"
                />
              </div>
            ) : null}
          </div>
          {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
        </div>
      )}

      {enableDrag ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={filtered.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {listBody}
          </SortableContext>
        </DndContext>
      ) : (
        listBody
      )}
    </div>
  );
}
