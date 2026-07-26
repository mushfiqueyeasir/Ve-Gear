import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface BkashSettings {
  enabled: boolean;
  sandbox: boolean;
  username: string | null;
  password: string | null;
  appKey: string | null;
  appSecret: string | null;
  hasPassword: boolean;
  hasAppSecret: boolean;
}

export interface BkashSettingsPublic {
  enabled: boolean;
  sandbox: boolean;
  username: string | null;
  appKey: string | null;
  hasPassword: boolean;
  hasAppSecret: boolean;
}

type BkashRow = {
  enabled: boolean;
  sandbox: boolean;
  username: string | null;
  password: string | null;
  app_key: string | null;
  app_secret: string | null;
};

function emptySettings(): BkashSettings {
  return {
    enabled: false,
    sandbox: true,
    username: null,
    password: null,
    appKey: null,
    appSecret: null,
    hasPassword: false,
    hasAppSecret: false,
  };
}

function mapRow(row: BkashRow): BkashSettings {
  const password = (row.password ?? "").trim() || null;
  const appSecret = (row.app_secret ?? "").trim() || null;
  return {
    enabled: Boolean(row.enabled),
    sandbox: row.sandbox !== false,
    username: row.username?.trim() || null,
    password,
    appKey: row.app_key?.trim() || null,
    appSecret,
    hasPassword: Boolean(password),
    hasAppSecret: Boolean(appSecret),
  };
}

/** Full settings including secrets — server-only. */
export async function getBkashSettings(): Promise<BkashSettings> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("bkash_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return emptySettings();
    return mapRow(data as BkashRow);
  } catch {
    return emptySettings();
  }
}

/** Safe for admin UI — secrets never included. */
export async function getBkashSettingsForAdmin(): Promise<BkashSettingsPublic> {
  const full = await getBkashSettings();
  return {
    enabled: full.enabled,
    sandbox: full.sandbox,
    username: full.username,
    appKey: full.appKey,
    hasPassword: full.hasPassword,
    hasAppSecret: full.hasAppSecret,
  };
}

export type SaveBkashInput = {
  enabled: boolean;
  sandbox: boolean;
  username: string | null;
  /** Empty / null means keep existing. */
  password: string | null;
  appKey: string | null;
  /** Empty / null means keep existing. */
  appSecret: string | null;
};

export async function saveBkashSettingsRow(
  input: SaveBkashInput,
): Promise<{ error?: string }> {
  const admin = createSupabaseAdminClient();

  const { data: current } = await admin
    .from("bkash_settings")
    .select("password, app_secret")
    .eq("id", 1)
    .maybeSingle();

  const existingPassword = ((current?.password as string | null) ?? "").trim();
  const existingSecret = ((current?.app_secret as string | null) ?? "").trim();
  const nextPassword = (input.password ?? "").trim();
  const nextSecret = (input.appSecret ?? "").trim();

  const payload = {
    id: 1,
    enabled: input.enabled,
    sandbox: input.sandbox,
    username: input.username?.trim() || null,
    password: nextPassword || existingPassword || null,
    app_key: input.appKey?.trim() || null,
    app_secret: nextSecret || existingSecret || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("bkash_settings").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    if (/bkash_settings|schema cache|does not exist/i.test(error.message)) {
      return {
        error:
          "bKash settings table is missing. Apply migration 0016_bkash_settings.sql on Supabase, then try again.",
      };
    }
    return { error: error.message };
  }
  return {};
}

export function isBkashReady(settings: BkashSettings): boolean {
  return Boolean(
    settings.enabled &&
    settings.username &&
    settings.password &&
    settings.appKey &&
    settings.appSecret,
  );
}
