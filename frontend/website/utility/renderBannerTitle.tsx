import type { ReactNode } from "react";

/**
 * Banner headline markup:
 * - Wrap words in *asterisks* for brand primary color: NOT JUST *RIDE*.
 * - ". " (period + space) starts a new line
 * - Plain newlines also start a new line
 * - Bare "RIDE" is still highlighted for older slides without markup
 */
export function renderBannerTitle(title: string): ReactNode {
  const segments = title.split(/(\*[^*]+\*)/g).filter((s) => s.length > 0);

  return segments.map((segment, i) => {
    const highlight = /^\*[^*]+\*$/.test(segment);
    const text = highlight ? segment.slice(1, -1) : segment;

    return (
      <span
        key={i}
        className={highlight ? "text-glow-coral text-primary" : undefined}
      >
        {highlight ? text : renderPlainWithBreaksAndLegacyRide(text)}
      </span>
    );
  });
}

function renderPlainWithBreaksAndLegacyRide(text: string): ReactNode {
  const parts = text.split(/(RIDE)/gi);
  if (parts.length === 1) {
    return renderBreaks(text);
  }
  return parts.map((part, i) =>
    /^ride$/i.test(part) ? (
      <span key={i} className="text-glow-coral text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>{renderBreaks(part)}</span>
    ),
  );
}

function renderBreaks(text: string): ReactNode {
  // Prefer explicit newlines; also break after ". " like the original hero.
  const chunks = text.split(/(\n|\. )/g);
  return chunks.map((chunk, j) => {
    if (chunk === "\n") return <br key={j} />;
    if (chunk === ". ")
      return (
        <span key={j}>
          .<br />
        </span>
      );
    return <span key={j}>{chunk}</span>;
  });
}
