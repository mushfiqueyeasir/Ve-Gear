import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

// KPI tile for the dashboard. Icon name is any key in components/admin/Icon.
export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: string;
  hint?: string;
  accent?: "primary" | "green" | "amber" | "blue" | "red";
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    blue: "bg-sky-500/15 text-sky-400",
    red: "bg-red-500/15 text-red-400",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            accents[accent],
          )}
        >
          <Icon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
