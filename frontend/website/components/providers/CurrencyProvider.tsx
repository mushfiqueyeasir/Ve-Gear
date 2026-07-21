"use client";

import { createContext, useContext, useMemo } from "react";
import {
  formatMoney,
  getCurrencyMeta,
  type CurrencyCode,
  type CurrencySettings,
} from "@/lib/currency";

interface CurrencyContextValue {
  code: CurrencyCode;
  symbol: string;
  enabled: CurrencyCode[];
  format: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  code: "BDT",
  symbol: "৳",
  enabled: ["USD", "BDT", "INR"],
  format: (v) => formatMoney(v, "৳"),
});

export function CurrencyProvider({
  currencies,
  children,
}: {
  currencies: CurrencySettings;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const meta = getCurrencyMeta(currencies.default);
    return {
      code: meta.code,
      symbol: meta.symbol,
      enabled: currencies.enabled,
      format: (v: number) => formatMoney(v, meta.symbol),
    };
  }, [currencies.default, currencies.enabled]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
