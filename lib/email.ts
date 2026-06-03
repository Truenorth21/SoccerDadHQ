import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "The Sideline <sideline@soccerdadhq.com>";

/** True only when a Resend API key is present, so callers fall back to no-op
 *  in demo mode and the rest of the app keeps working with zero config. */
export const isEmailConfigured = Boolean(KEY);

export interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
}

/** Sends one transactional email via Resend. No-op (sent:false) when unconfigured. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  if (!KEY) return { sent: false, error: "email-not-configured" };
  try {
    const resend = new Resend(KEY);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (e: any) {
    return { sent: false, error: e?.message ?? "send-failed" };
  }
}
