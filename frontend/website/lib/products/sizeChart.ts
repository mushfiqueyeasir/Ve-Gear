export interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
}

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
