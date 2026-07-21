"use client";

import emailjs from "@emailjs/browser";

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
  const emailJsServiceId = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID;
  const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY;
  const clientEmail = process.env.NEXT_PUBLIC_EMAIL_ADDRESS || "";

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
