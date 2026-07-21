interface ProductDescriptionProps {
  description: { html?: string } | null;
}

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  const html = description?.html?.trim();
  if (!html) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">
        Description
      </h2>
      <div
        className="prose prose-invert prose-sm max-w-none text-muted-foreground [&_a]:underline [&_h1]:text-2xl [&_h1]:text-foreground [&_h2]:text-xl [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:text-foreground [&_img]:my-4 [&_img]:rounded [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
