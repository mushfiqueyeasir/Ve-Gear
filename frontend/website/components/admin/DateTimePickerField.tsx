"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/FormField";

/** Matches existing `datetime-local` value shape: `YYYY-MM-DDTHH:mm` */
function parseLocalInput(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = parse(value.trim(), "yyyy-MM-dd'T'HH:mm", new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toLocalInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function DateTimePickerField({
  id,
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
  disablePast = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseLocalInput(value), [value]);
  const today = startOfDay(new Date());

  const hour = selected ? format(selected, "HH") : "00";
  const minute = selected
    ? (() => {
        const m = Number(format(selected, "mm"));
        const snapped = Math.round(m / 15) * 15;
        return String(snapped === 60 ? 45 : snapped).padStart(2, "0");
      })()
    : "00";

  const applyDateTime = (date: Date, nextHour = hour, nextMinute = minute) => {
    const next = new Date(date);
    next.setHours(Number(nextHour), Number(nextMinute), 0, 0);
    if (disablePast && next.getTime() < Date.now()) {
      // Keep selection usable: clamp to now when past is disallowed.
      const now = new Date();
      onChange(toLocalInput(now));
      return;
    }
    onChange(toLocalInput(next));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            adminInputClass,
            "flex w-full items-center justify-between gap-2 px-3 text-left text-sm text-foreground outline-none transition hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected ? format(selected, "MMM d, yyyy · h:mm a") : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto space-y-3 p-3">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("");
              return;
            }
            applyDateTime(date);
          }}
          disabled={disablePast ? { before: today } : undefined}
          defaultMonth={selected ?? today}
        />
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Select
            value={hour}
            onValueChange={(h) => {
              const base = selected ?? new Date();
              applyDateTime(base, h, minute);
            }}
          >
            <SelectTrigger className={cn(adminSelectClass, "h-10 flex-1")}>
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={minute}
            onValueChange={(m) => {
              const base = selected ?? new Date();
              applyDateTime(base, hour, m);
            }}
          >
            <SelectTrigger className={cn(adminSelectClass, "h-10 flex-1")}>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
