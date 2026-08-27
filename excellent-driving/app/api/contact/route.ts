import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email is not configured yet — please reach out via WhatsApp instead." },
      { status: 503 }
    );
  }

  const { name, email, message } = parsed.data;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Excellent Driving Website <onboarding@resend.dev>",
    to: "info@excellentdriving.sr",
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send. Please try WhatsApp instead." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
