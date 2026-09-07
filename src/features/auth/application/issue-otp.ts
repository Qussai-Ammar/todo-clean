import { OtpCode } from "../domain/otp-code.entity";
import { OtpCodeRepository } from "../domain/otp-code.repository";
import { generateOtpCode } from "./generate-otp-code";
import { buildOtpEmail } from "./otp-email";
import { OTP_EXPIRY_MINUTES } from "./otp-config";
import { EmailSender } from "./ports/email-sender";
import { PasswordHasher } from "./ports/password-hasher";

export async function issueAndSendOtp(
  email: string,
  deps: { otpCodeRepository: OtpCodeRepository; codeHasher: PasswordHasher; emailSender: EmailSender }
): Promise<void> {
  const code = generateOtpCode();
  const codeHash = await deps.codeHasher.hash(code);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60_000);

  await deps.otpCodeRepository.save(OtpCode.issue(email, codeHash, expiresAt, now));
  await deps.emailSender.send(buildOtpEmail(email, code, OTP_EXPIRY_MINUTES));
}
