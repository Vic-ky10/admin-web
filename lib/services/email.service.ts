import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Set it in your environment variables."
    );
  }

  return new Resend(apiKey);
}

function getFromEmail(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured. Set it in your environment variables."
    );
  }

  return fromEmail;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<void> {
  const resend = getResendClient();
  const from = getFromEmail();

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(
      error.message || "Unable to send email via Resend."
    );
  }
}
