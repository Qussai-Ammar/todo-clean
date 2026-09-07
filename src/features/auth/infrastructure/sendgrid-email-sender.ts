import sgMail from "@sendgrid/mail";
import { EmailMessage, EmailSender } from "../application/ports/email-sender";

export class SendGridEmailSender implements EmailSender {
  constructor(apiKey: string, private readonly fromEmail: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(message: EmailMessage): Promise<void> {
    await sgMail.send({
      to: message.to,
      from: this.fromEmail,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
