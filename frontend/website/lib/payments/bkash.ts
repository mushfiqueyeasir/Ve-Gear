import "server-only";

import {
  getBkashSettings,
  isBkashReady,
  type BkashSettings,
} from "@/lib/payments/bkashSettings";

const SANDBOX_BASE = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
const LIVE_BASE = "https://tokenized.pay.bka.sh/v1.2.0-beta";

type TokenCache = {
  key: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

function baseUrl(sandbox: boolean) {
  return sandbox ? SANDBOX_BASE : LIVE_BASE;
}

async function bkashFetch<T>(
  settings: BkashSettings,
  path: string,
  init: RequestInit & { idToken?: string },
): Promise<T> {
  const { idToken, headers: initHeaders, ...rest } = init;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-app-key": settings.appKey!,
    ...(initHeaders as Record<string, string> | undefined),
  };
  if (idToken) headers.authorization = idToken;

  const res = await fetch(`${baseUrl(settings.sandbox)}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    statusCode?: string;
    statusMessage?: string;
    errorCode?: string;
    errorMessage?: string;
    msg?: string;
  };

  const apiError =
    data.errorMessage ||
    data.msg ||
    (data.statusCode && data.statusCode !== "0000" ? data.statusMessage : null);

  if (!res.ok || apiError) {
    throw new Error(
      apiError || data.statusMessage || `bKash request failed (${res.status})`,
    );
  }
  return data;
}

export async function grantBkashToken(
  settings?: BkashSettings,
): Promise<string> {
  const cfg = settings ?? (await getBkashSettings());
  if (!isBkashReady(cfg)) {
    throw new Error("bKash is not configured or not enabled.");
  }

  const now = Date.now();
  const cacheKey = `${cfg.sandbox ? "sandbox" : "live"}:${cfg.appKey}`;
  if (
    tokenCache &&
    tokenCache.key === cacheKey &&
    tokenCache.expiresAt > now + 60_000
  ) {
    return tokenCache.idToken;
  }

  const data = await bkashFetch<{
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
    statusCode?: string;
    statusMessage?: string;
  }>(cfg, "/tokenized/checkout/token/grant", {
    method: "POST",
    body: JSON.stringify({
      app_key: cfg.appKey,
      app_secret: cfg.appSecret,
    }),
    headers: {
      username: cfg.username!,
      password: cfg.password!,
    },
  });

  if (!data.id_token) {
    throw new Error(data.statusMessage || "Failed to get bKash token.");
  }

  const expiresInSec = Number(data.expires_in) || 3600;
  tokenCache = {
    key: cacheKey,
    idToken: data.id_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt: now + expiresInSec * 1000,
  };
  return data.id_token;
}

export type CreateBkashPaymentInput = {
  amount: number;
  merchantInvoiceNumber: string;
  payerReference: string;
  callbackURL: string;
};

export type CreateBkashPaymentResult = {
  paymentID: string;
  bkashURL: string;
  statusCode?: string;
  statusMessage?: string;
};

export async function createBkashPayment(
  input: CreateBkashPaymentInput,
): Promise<CreateBkashPaymentResult> {
  const settings = await getBkashSettings();
  const idToken = await grantBkashToken(settings);
  const amount = Number(input.amount).toFixed(2);

  const data = await bkashFetch<CreateBkashPaymentResult>(
    settings,
    "/tokenized/checkout/create",
    {
      method: "POST",
      idToken,
      body: JSON.stringify({
        mode: "0011",
        payerReference: input.payerReference.slice(0, 255),
        callbackURL: input.callbackURL,
        amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: input.merchantInvoiceNumber.slice(0, 255),
      }),
    },
  );

  if (!data.paymentID || !data.bkashURL) {
    throw new Error(data.statusMessage || "Failed to create bKash payment.");
  }
  return data;
}

export type ExecuteBkashPaymentResult = {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  statusCode?: string;
  statusMessage?: string;
  customerMsisdn?: string;
};

export async function executeBkashPayment(
  paymentID: string,
): Promise<ExecuteBkashPaymentResult> {
  const settings = await getBkashSettings();
  const idToken = await grantBkashToken(settings);

  return bkashFetch<ExecuteBkashPaymentResult>(
    settings,
    "/tokenized/checkout/execute",
    {
      method: "POST",
      idToken,
      body: JSON.stringify({ paymentID }),
    },
  );
}

export async function queryBkashPayment(
  paymentID: string,
): Promise<ExecuteBkashPaymentResult> {
  const settings = await getBkashSettings();
  const idToken = await grantBkashToken(settings);

  return bkashFetch<ExecuteBkashPaymentResult>(
    settings,
    "/tokenized/checkout/payment/status",
    {
      method: "POST",
      idToken,
      body: JSON.stringify({ paymentID }),
    },
  );
}
