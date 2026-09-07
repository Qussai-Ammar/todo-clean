import { EmailMessage } from "./ports/email-sender";

export function buildOtpEmail(email: string, code: string, expiryMinutes: number): EmailMessage {
  return {
    to: email,
    subject: `${code} is your Todo Clean verification code`,
    text: `Your verification code is ${code}. It expires in ${expiryMinutes} minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin-bottom: 4px;">Verify your email</h2>
        <p style="color: #6b7280;">Enter this code to finish creating your Todo Clean account.</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f5f6f8; border-radius: 8px; padding: 16px 24px; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in ${expiryMinutes} minutes. If you didn't request it, you can safely ignore this email.</p>
      </div>
    `,
  };
}
