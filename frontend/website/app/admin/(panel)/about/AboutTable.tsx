"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import { GripVertical, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { AboutSectionRow } from "@/lib/cms/aboutSections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { reorderAboutSections, toggleAboutSection } from "./actions";

function ActiveToggle({
  id,
  active,
  canWrite,
}: {
  id: string;
  active: boolean;
  canWrite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!canWrite) {
    return (
      <Badge variant={active ? "success" : "secondary"}>
        {active ? "Visible" : "Hidden"}
      </Badge>
    );
  }

  return (
    <Switch
      checked={active}
      disabled={pending}
      onCheckedChange={(next) =>
        startTransition(async () => {
          const res = await toggleAboutSection(id, next);
          if (res?.error) toast.error(res.error);
          else toast.success(next ? "Shown" : "Hidden");
        })
      }
      aria-label="Toggle visibility"
    />
  );
}

function SortableRow({
  section,
  canWrite,
}: {
  section: AboutSectionRow;
  canWrite: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: !canWrite });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-3 py-3 sm:px-4",
        isDragging &&
          "z-10 border-primary/50 bg-card shadow-lg shadow-black/40",
      )}
    >
      {canWrite ? (
        <button
          type="button"
          className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-xl text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="size-9 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {section.type}
          </Badge>
          <p className="truncate font-medium text-foreground">
            {section.title || section.type}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ActiveToggle
          id={section.id}
          active={section.active}
          canWrite={canWrite}
        />
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/admin/about/${section.id}`} aria-label="Edit">
            <Pencil className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AboutTable({
  data,
  canWrite,
}: {
  data: AboutSectionRow[];
  canWrite: boolean;
}) {
  const [items, setItems] = useState(data);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    if (!canWrite) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(async () => {
      const res = await reorderAboutSections(next.map((i) => i.id));
      if (res?.error) {
        setItems(previous);
        toast.error(res.error);
        return;
      }
      toast.success("Order updated");
    });
  };

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-border bg-card/80 px-4 py-10 text-center text-sm text-muted-foreground">
        No About sections configured.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {canWrite ? (
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Edit a section to control its copy and images.
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                canWrite={canWrite}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
