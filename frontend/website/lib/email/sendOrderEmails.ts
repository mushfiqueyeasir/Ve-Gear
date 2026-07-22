import "server-only";

import nodemailer from "nodemailer";
import { getGmailCredentials, getOrderNotifyEmails } from "@/lib/config.server";
import {
  buildCustomerOrderEmailHtml,
  buildOwnerOrderEmailHtml,
  type OrderEmailPayload,
} from "@/lib/email/orderEmailHtml";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function sendOrderEmails(payload: OrderEmailPayload) {
  const { user, appPassword } = getGmailCredentials();
  const ownerEmails = getOrderNotifyEmails().filter(isValidEmail);

  if (!user || !appPassword) {
    return { sent: false, reason: "Gmail credentials missing in config.json" };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass: appPassword,
    },
  });

  const results: { to: string; role: "customer" | "owner"; ok: boolean }[] = [];

  const customerEmail = payload.customerEmail.trim();
  const customerNorm = normalizeEmail(customerEmail);

  // 1) Customer confirmation — To customer only. Never CC store notify emails.
  if (isValidEmail(customerEmail)) {
    try {
      await transporter.sendMail({
        from: `"VE Gear" <${user}>`,
        to: customerEmail,
        subject: `Order received · ${payload.orderNumber}`,
        html: buildCustomerOrderEmailHtml(payload),
      });
      results.push({ to: customerEmail, role: "customer", ok: true });
    } catch {
      results.push({ to: customerEmail, role: "customer", ok: false });
    }
  }

  // 2) Single owner alert — To store Gmail, CC notify list (not the customer).
  const ccList = ownerEmails.filter(
    (email) =>
      normalizeEmail(email) !== normalizeEmail(user) &&
      normalizeEmail(email) !== customerNorm,
  );

  const shouldNotifyOwners =
    isValidEmail(user) || ccList.length > 0 || ownerEmails.length > 0;

  if (shouldNotifyOwners) {
    try {
      await transporter.sendMail({
        from: `"VE Gear Orders" <${user}>`,
        to: user,
        ...(ccList.length > 0 ? { cc: ccList.join(", ") } : {}),
        replyTo: isValidEmail(customerEmail) ? customerEmail : undefined,
        subject: `New order · ${payload.orderNumber} · ${payload.customerName}`,
        html: buildOwnerOrderEmailHtml(payload),
      });
      results.push({ to: user, role: "owner", ok: true });
      for (const cc of ccList) {
        results.push({ to: cc, role: "owner", ok: true });
      }
    } catch {
      results.push({ to: user, role: "owner", ok: false });
      for (const cc of ccList) {
        results.push({ to: cc, role: "owner", ok: false });
      }
    }
  }

  return { sent: results.some((r) => r.ok), results };
}
