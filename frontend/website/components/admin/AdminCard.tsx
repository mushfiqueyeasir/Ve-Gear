import { cn } from "@/lib/utils";

export function AdminCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-5 sm:p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
