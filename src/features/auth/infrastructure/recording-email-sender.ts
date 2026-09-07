import { EmailMessage, EmailSender } from "../application/ports/email-sender";

/**
 * Test/local double that captures sent messages instead of delivering them.
 * Lets tests (or a debug endpoint) recover the OTP code without a real inbox.
 */
export class RecordingEmailSender implements EmailSender {
  private readonly sentByRecipient = new Map<string, EmailMessage[]>();

  async send(message: EmailMessage): Promise<void> {
    const existing = this.sentByRecipient.get(message.to) ?? [];
    existing.push(message);
    this.sentByRecipient.set(message.to, existing);
  }

  lastMessageTo(email: string): EmailMessage | null {
    const messages = this.sentByRecipient.get(email);
    return messages && messages.length > 0 ? messages[messages.length - 1] : null;
  }

  extractLastOtpCode(email: string): string | null {
    const message = this.lastMessageTo(email);
    if (!message) return null;
    const match = message.text.match(/\b(\d{6})\b/);
    return match ? match[1] : null;
  }
}
