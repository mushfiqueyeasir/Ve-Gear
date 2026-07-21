export interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
}

export type ProductDescription = {
  html?: string;
  size_chart?: SizeChartRow[];
} | null;

export const DEFAULT_TEE_SIZE_CHART: SizeChartRow[] = [
  { size: "M", chest: "22", length: "28" },
  { size: "L", chest: "23", length: "29" },
  { size: "XL", chest: "24.5", length: "30" },
  { size: "2XL", chest: "26", length: "31" },
];

export function normalizeSizeChart(raw: unknown): SizeChartRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const size = String(r.size ?? "").trim();
      const chest = String(r.chest ?? "").trim();
      const length = String(r.length ?? "").trim();
      if (!size || (!chest && !length)) return null;
      return { size, chest, length };
    })
    .filter((r): r is SizeChartRow => Boolean(r));
}

/** Prefer dedicated column; fall back to embedding in description jsonb. */
export function resolveSizeChart(
  columnValue: unknown,
  description: unknown,
): SizeChartRow[] {
  const fromColumn = normalizeSizeChart(columnValue);
  if (fromColumn.length) return fromColumn;

  if (description && typeof description === "object") {
    return normalizeSizeChart(
      (description as { size_chart?: unknown }).size_chart,
    );
  }
  return [];
}

/** Keep html for the storefront; optionally embed size_chart when the column is missing. */
export function buildDescriptionPayload(
  description: { html?: string } | null | undefined,
  sizeChart: SizeChartRow[] | null,
  embedChart: boolean,
): ProductDescription {
  const html = description?.html?.trim() ? description.html : undefined;
  if (!embedChart) {
    return html ? { html } : null;
  }
  if (sizeChart?.length) {
    return html ? { html, size_chart: sizeChart } : { size_chart: sizeChart };
  }
  return html ? { html } : null;
}
