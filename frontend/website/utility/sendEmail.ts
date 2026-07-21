"use client";

import emailjs from "@emailjs/browser";
import { appConfig } from "@/lib/config";

interface SendEmailParams {
  subject: string;
  body: Record<string, string>;
  emailJsTemplateId?: string;
  toEmail?: string;
}

export async function sendEmail({
  subject,
  body,
  emailJsTemplateId,
  toEmail,
}: SendEmailParams): Promise<void> {
  const emailJsServiceId = appConfig.email.serviceId;
  const emailJsPublicKey = appConfig.email.publicKey;
  const clientEmail = appConfig.email.address;

  // Email notifications are optional. If EmailJS isn't configured, no-op
  // silently so order/contact flows are unaffected.
  if (!emailJsServiceId || !emailJsPublicKey) {
    return;
  }

  const finalTemplateId = emailJsTemplateId;
  const finalToEmail = toEmail || clientEmail;

  if (!finalTemplateId || !finalToEmail || !subject) {
    return;
  }

  try {
    await emailjs.send(
      emailJsServiceId,
      finalTemplateId,
      {
        to_email: finalToEmail,
        subject: subject,
        ...body,
      },
      emailJsPublicKey,
    );
  } catch (error) {
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
