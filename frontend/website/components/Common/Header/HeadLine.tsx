import Link from "next/link";

interface HeadLineProps {
  text?: string | null;
  active?: boolean;
  url?: string | null;
}

export default function HeadLine({ text, active, url }: HeadLineProps) {
  if (!active || !text?.trim()) return null;

  const content = (
    <p className="font-mono text-[11px] uppercase tracking-[0.25em]">{text}</p>
  );

  return (
    <div className="relative z-[60] bg-primary py-2 text-center text-primary-foreground">
      {url ? (
        <Link href={url} className="transition-opacity hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
