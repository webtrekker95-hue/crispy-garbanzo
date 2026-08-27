import { Resend } from "resend";

type SendResult = { success: boolean; channel: "whatsapp" | "email" | "none"; error?: string };

/**
 * Sends a WhatsApp message via the Meta WhatsApp Business Cloud API.
 * Requires a verified Meta Business account + registered message templates
 * in production (see Claude.md's WhatsApp notes) — this calls the same
 * Graph API shape, but cannot be exercised end-to-end without real
 * WHATSAPP_API_KEY / WHATSAPP_PHONE_NUMBER_ID credentials.
 */
async function sendWhatsAppMessage(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    return { ok: false, error: "WhatsApp is not configured (missing WHATSAPP_API_KEY / WHATSAPP_PHONE_NUMBER_ID)." };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      return { ok: false, error: `WhatsApp API error (${res.status}): ${errText}` };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown WhatsApp send error" };
  }
}

async function sendEmailFallback(to: string, subject: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Email fallback is not configured (missing RESEND_API_KEY)." };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Excellent Driving <onboarding@resend.dev>",
      to,
      subject,
      text: body,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown email send error" };
  }
}

/**
 * Sends a notification via WhatsApp; on failure, falls back to email per
 * Claude.md's spec ("if WhatsApp fails, log error and send email via Resend").
 * Never throws — a notification failure should never break the calling
 * request (booking creation, payment confirmation, etc).
 */
export async function notify(params: {
  phone: string | null;
  email: string;
  subject: string;
  message: string;
}): Promise<SendResult> {
  const { phone, email, subject, message } = params;

  if (phone) {
    const waResult = await sendWhatsAppMessage(phone, message);
    if (waResult.ok) return { success: true, channel: "whatsapp" };
    console.error(`[whatsapp] send failed for ${phone}: ${waResult.error}`);
  }

  const emailResult = await sendEmailFallback(email, subject, message);
  if (emailResult.ok) return { success: true, channel: "email" };
  console.error(`[whatsapp] email fallback also failed for ${email}: ${emailResult.error}`);

  return { success: false, channel: "none", error: emailResult.error };
}

export const templates = {
  bookingConfirmation: (params: { name: string; instructor: string; date: string; time: string; method: string }) =>
    `Hi ${params.name}, your booking with ${params.instructor} on ${params.date} at ${params.time} is confirmed. Payment: ${params.method}.`,

  bookingReminder: (params: { time: string; instructor: string }) =>
    `Reminder: Your driving lesson is tomorrow at ${params.time} with ${params.instructor}. See you there!`,

  paymentConfirmed: (params: { packageName: string }) =>
    `Your payment for ${params.packageName} has been confirmed. You now have access to your online lessons!`,

  bookingCancelled: (params: { date: string; time: string }) =>
    `Your booking on ${params.date} at ${params.time} has been cancelled.`,

  instructorNewBooking: (params: { studentName: string; date: string; time: string }) =>
    `New booking: ${params.studentName} booked a lesson with you on ${params.date} at ${params.time}.`,
};
