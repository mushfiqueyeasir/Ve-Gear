import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const adminInputClass =
  "h-11 rounded-xl border-border bg-background shadow-none";

export const adminTextareaClass =
  "rounded-xl border-border bg-background shadow-none";

export const adminSelectClass =
  "h-11 rounded-xl border-border bg-background shadow-none";

export function FormField({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-border pt-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
