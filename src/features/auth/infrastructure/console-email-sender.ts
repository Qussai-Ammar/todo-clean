import { EmailMessage, EmailSender } from "../application/ports/email-sender";

/**
 * Development fallback used when no SendGrid API key is configured. Logs
 * the email to the server console instead of failing to boot, so the app
 * (and the OTP flow) stays runnable without real email credentials.
 */
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.log(
      `\n[dev email] To: ${message.to}\nSubject: ${message.subject}\n${message.text}\n`
    );
  }
}
