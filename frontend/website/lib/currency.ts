export type CurrencyCode = "USD" | "BDT" | "INR";

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "USD", symbol: "$", label: "US Dollar", flag: "US" },
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka", flag: "BD" },
  { code: "INR", symbol: "₹", label: "Indian Rupee", flag: "IN" },
];

export interface CurrencySettings {
  /** Enabled store currencies (at least one). */
  enabled: CurrencyCode[];
  /** Default / active storefront currency. */
  default: CurrencyCode;
}

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  enabled: ["USD", "BDT", "INR"],
  default: "BDT",
};

export function getCurrencyMeta(code: string): CurrencyOption {
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0]
  );
}

export function normalizeCurrencySettings(
  raw?: Partial<CurrencySettings> | null,
): CurrencySettings {
  const enabled = (raw?.enabled ?? DEFAULT_CURRENCY_SETTINGS.enabled).filter(
    (c): c is CurrencyCode =>
      SUPPORTED_CURRENCIES.some((opt) => opt.code === c),
  );
  const unique = Array.from(new Set(enabled.length ? enabled : ["BDT"]));
  const def = (
    unique.includes(raw?.default as CurrencyCode) ? raw!.default : unique[0]
  ) as CurrencyCode;
  return { enabled: unique as CurrencyCode[], default: def };
}

export function formatMoney(value: number, symbolOrCode: string = "৳"): string {
  const meta = getCurrencyMeta(symbolOrCode);
  const symbol = meta.code === symbolOrCode ? meta.symbol : symbolOrCode;
  const n = Number.isFinite(value) ? value : 0;
  return `${symbol}${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
