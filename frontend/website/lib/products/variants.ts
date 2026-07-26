import { DEFAULT_TEE_SIZE_CHART } from "@/lib/products/sizeChart";

export interface DefaultVariantRow {
  size: string;
  color: string;
  sku: string;
  price_override: string;
  stock_quantity: string;
  low_stock_threshold: string;
}

/** Standard tee sizes — same set as the size chart defaults. */
export const DEFAULT_TEE_VARIANTS: DefaultVariantRow[] =
  DEFAULT_TEE_SIZE_CHART.map((row) => ({
    size: row.size,
    color: "",
    sku: "",
    price_override: "",
    stock_quantity: "0",
    low_stock_threshold: "5",
  }));
