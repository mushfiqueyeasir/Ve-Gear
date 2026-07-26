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
import { cn } from "@/lib/utils";
import { adminInputClass } from "@/components/admin/FormField";

function parseYmd(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = parse(value.trim(), "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toYmd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  /** When true, dates before today cannot be selected. */
  disablePast = false,
  className,
}: {
  id?: string;
  /** `YYYY-MM-DD` */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePast?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseYmd(value), [value]);
  const today = startOfDay(new Date());

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
            {selected ? format(selected, "MMM d, yyyy") : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange("");
              return;
            }
            onChange(toYmd(date));
            setOpen(false);
          }}
          disabled={disablePast ? { before: today } : undefined}
          defaultMonth={selected ?? today}
        />
      </PopoverContent>
    </Popover>
  );
}
