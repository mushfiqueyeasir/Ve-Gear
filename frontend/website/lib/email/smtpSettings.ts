import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGmailCredentials, getOrderNotifyEmails } from "@/lib/config.server";

export type SmtpProvider = "gmail" | "smtp";

export interface SmtpSettings {
  enabled: boolean;
  provider: SmtpProvider;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  /** Never send raw password to the client — only a flag. */
  hasPassword: boolean;
  password: string | null;
  fromName: string;
  fromEmail: string | null;
  notifyEmails: string[];
}

export interface SmtpSettingsPublic {
  enabled: boolean;
  provider: SmtpProvider;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string | null;
  notifyEmails: string[];
}

type SmtpRow = {
  enabled: boolean;
  provider: string;
  host: string | null;
  port: number | null;
  secure: boolean;
  username: string | null;
  password: string | null;
  from_name: string | null;
  from_email: string | null;
  notify_emails: string[] | null;
};

function fromConfigFallback(): SmtpSettings {
  const { user, appPassword } = getGmailCredentials();
  return {
    enabled: Boolean(user && appPassword),
    provider: "gmail",
    host: null,
    port: 587,
    secure: false,
    username: user || null,
    hasPassword: Boolean(appPassword),
    password: appPassword || null,
    fromName: "VE Gear",
    fromEmail: user || null,
    notifyEmails: getOrderNotifyEmails(),
  };
}

function mapRow(row: SmtpRow): SmtpSettings {
  const password = (row.password ?? "").replace(/\s+/g, "") || null;
  return {
    enabled: Boolean(row.enabled),
    provider: row.provider === "smtp" ? "smtp" : "gmail",
    host: row.host?.trim() || null,
    port: Number(row.port) > 0 ? Number(row.port) : 587,
    secure: Boolean(row.secure),
    username: row.username?.trim() || null,
    hasPassword: Boolean(password),
    password,
    fromName: row.from_name?.trim() || "VE Gear",
    fromEmail: row.from_email?.trim() || row.username?.trim() || null,
    notifyEmails: Array.isArray(row.notify_emails)
      ? row.notify_emails.map((e) => String(e).trim()).filter(Boolean)
      : [],
  };
}

/** Full settings including password — server-only. */
export async function getSmtpSettings(): Promise<SmtpSettings> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("email_smtp_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      return fromConfigFallback();
    }

    if (!data) {
      // Table exists but empty — seed once from config.json so the Email tab works.
      const fallback = fromConfigFallback();
      if (fallback.username || fallback.password) {
        await admin.from("email_smtp_settings").upsert(
          {
            id: 1,
            enabled: fallback.enabled,
            provider: "gmail",
            host: null,
            port: 587,
            secure: false,
            username: fallback.username,
            password: fallback.password,
            from_name: fallback.fromName,
            from_email: fallback.fromEmail,
            notify_emails: fallback.notifyEmails,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }
      return fallback;
    }

    const mapped = mapRow(data as SmtpRow);
    // If DB row exists but is empty with no creds, fall back to config.
    if (!mapped.username && !mapped.password) {
      const fallback = fromConfigFallback();
      return {
        ...fallback,
        enabled: mapped.enabled || fallback.enabled,
        notifyEmails: mapped.notifyEmails.length
          ? mapped.notifyEmails
          : fallback.notifyEmails,
        fromName: mapped.fromName || fallback.fromName,
      };
    }
    return mapped;
  } catch {
    return fromConfigFallback();
  }
}

/** Safe for admin UI — password never included. */
export async function getSmtpSettingsForAdmin(): Promise<SmtpSettingsPublic> {
  const full = await getSmtpSettings();
  return {
    enabled: full.enabled,
    provider: full.provider,
    host: full.host,
    port: full.port,
    secure: full.secure,
    username: full.username,
    hasPassword: full.hasPassword,
    fromName: full.fromName,
    fromEmail: full.fromEmail,
    notifyEmails: full.notifyEmails,
  };
}

export type SaveSmtpInput = {
  enabled: boolean;
  provider: SmtpProvider;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  /** Empty / null means keep existing password. */
  password: string | null;
  fromName: string;
  fromEmail: string | null;
  notifyEmails: string[];
};

export async function saveSmtpSettingsRow(
  input: SaveSmtpInput,
): Promise<{ error?: string }> {
  const admin = createSupabaseAdminClient();

  const { data: current } = await admin
    .from("email_smtp_settings")
    .select("password")
    .eq("id", 1)
    .maybeSingle();

  const existingPassword = ((current?.password as string | null) ?? "")
    .replace(/\s+/g, "")
    .trim();
  const nextPassword = (input.password ?? "").replace(/\s+/g, "").trim();
  const password = nextPassword || existingPassword || null;

  const payload = {
    id: 1,
    enabled: input.enabled,
    provider: input.provider,
    host: input.provider === "smtp" ? input.host?.trim() || null : null,
    port: input.port > 0 ? input.port : 587,
    secure: input.secure,
    username: input.username?.trim() || null,
    password,
    from_name: input.fromName.trim() || "VE Gear",
    from_email: input.fromEmail?.trim() || input.username?.trim() || null,
    notify_emails: input.notifyEmails.map((e) => e.trim()).filter(Boolean),
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from("email_smtp_settings").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    if (
      /email_smtp_settings|schema cache|does not exist/i.test(error.message)
    ) {
      return {
        error:
          "Notification email settings table is missing. Apply migration 0015_email_smtp_settings.sql on Supabase, then try again.",
      };
    }
    return { error: error.message };
  }
  return {};
}
