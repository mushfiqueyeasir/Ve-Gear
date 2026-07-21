interface CmsPageScreenProps {
  eyebrow?: string;
  title: string;
  bodyHtml: string;
}

export default function CmsPageScreen({
  eyebrow = "VE Gear",
  title,
  bodyHtml,
}: CmsPageScreenProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <div
        className="prose prose-invert mt-8 max-w-none text-muted-foreground prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </section>
  );
}
