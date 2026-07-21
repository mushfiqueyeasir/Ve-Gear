import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title?: string | null;
  subtitle?: string | null;
  align?: "center" | "left";
  action?: { label: string; href: string };
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  action,
}: SectionHeadingProps) {
  if (!title && !subtitle) return null;

  const centered = align === "center";

  return (
    <div
      className={`mb-8 lg:mb-12 flex flex-col gap-3 ${
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "space-y-2" : "space-y-2"}>
        {title && (
          <h2 className="font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="max-w-xl text-sm text-foreground/60 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action && !centered && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
