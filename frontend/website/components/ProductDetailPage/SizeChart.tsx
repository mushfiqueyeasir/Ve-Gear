import type { ProductSizeChartRow } from "@/type/productType";

interface SizeChartProps {
  sizeChart: ProductSizeChartRow[];
  compact?: boolean;
}

export default function SizeChart({
  sizeChart,
  compact = false,
}: SizeChartProps) {
  if (!sizeChart.length) return null;

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            Size chart
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Measurements in inches. Compare with a tee that fits you well.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[280px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-card/80">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Size
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Chest
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Length
              </th>
            </tr>
          </thead>
          <tbody>
            {sizeChart.map((row) => (
              <tr
                key={row.size}
                className="border-b border-border/70 last:border-0"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {row.size}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row.chest ? `${row.chest} in` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row.length ? `${row.length} in` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Chest</span> — measure
          under the armpits, seam to seam across the front.
        </p>
        <p>
          <span className="font-medium text-foreground">Length</span> — measure
          from the shoulder/collar join straight down to the hem.
        </p>
      </div>
    </div>
  );
}
