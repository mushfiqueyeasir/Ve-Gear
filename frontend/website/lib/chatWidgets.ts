export type ChatProvider = "none" | "whatsapp" | "messenger";

export interface ChatWidgets {
  /** Only one provider can be active at a time. */
  provider: ChatProvider;
  /** Digits with country code, e.g. 8801712345678 (no + or spaces required). */
  whatsappNumber: string;
  /** Numeric Facebook Page ID for the on-site Messenger chat plugin. */
  messengerPageId: string;
}

export const DEFAULT_CHAT_WIDGETS: ChatWidgets = {
  provider: "none",
  whatsappNumber: "",
  messengerPageId: "",
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeChatWidgets(raw: unknown): ChatWidgets {
  const base = { ...DEFAULT_CHAT_WIDGETS };
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  const legacyWhatsapp =
    typeof o.whatsappCode === "string" ? o.whatsappCode.trim() : "";
  const legacyMessenger =
    typeof o.messengerCode === "string" ? o.messengerCode.trim() : "";

  let provider: ChatProvider = "none";
  if (o.provider === "whatsapp" || o.provider === "messenger") {
    provider = o.provider;
  } else if (legacyWhatsapp && !legacyMessenger) {
    provider = "whatsapp";
  } else if (legacyMessenger && !legacyWhatsapp) {
    provider = "messenger";
  }

  return {
    provider,
    whatsappNumber:
      typeof o.whatsappNumber === "string"
        ? digitsOnly(o.whatsappNumber)
        : base.whatsappNumber,
    messengerPageId:
      typeof o.messengerPageId === "string"
        ? o.messengerPageId.trim().replace(/^@/, "")
        : base.messengerPageId,
  };
}

export function chatWhatsappHref(number: string): string | null {
  const digits = digitsOnly(number);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

/** Messenger Customer Chat needs a numeric Page ID. */
export function isNumericPageId(pageId: string): boolean {
  return /^\d{5,}$/.test(pageId.trim());
}

export function hasChatWidgets(
  widgets: ChatWidgets | null | undefined,
): boolean {
  if (!widgets || widgets.provider === "none") return false;
  if (widgets.provider === "whatsapp") {
    return Boolean(chatWhatsappHref(widgets.whatsappNumber));
  }
  return isNumericPageId(widgets.messengerPageId);
}
