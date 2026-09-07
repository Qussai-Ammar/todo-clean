import { NotFoundError, ValidationError } from "../../../shared/domain/errors/app-error";
import { OtpCooldownError } from "../domain/auth-errors";
import { OtpCodeRepository } from "../domain/otp-code.repository";
import { UserRepository } from "../domain/user.repository";
import { issueAndSendOtp } from "./issue-otp";
import { OTP_RESEND_COOLDOWN_SECONDS } from "./otp-config";
import { EmailSender } from "./ports/email-sender";
import { PasswordHasher } from "./ports/password-hasher";

export class ResendOtpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpCodeRepository: OtpCodeRepository,
    private readonly codeHasher: PasswordHasher,
    private readonly emailSender: EmailSender
  ) {}

  async execute(rawEmail: string): Promise<{ message: string }> {
    const email = rawEmail.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Account");
    }

    if (user.isVerified) {
      throw new ValidationError("This account is already verified");
    }

    const existing = await this.otpCodeRepository.findByEmail(email);
    if (existing) {
      const wait = existing.secondsUntilResendAllowed(new Date(), OTP_RESEND_COOLDOWN_SECONDS);
      if (wait > 0) {
        throw new OtpCooldownError(wait);
      }
    }

    await issueAndSendOtp(email, {
      otpCodeRepository: this.otpCodeRepository,
      codeHasher: this.codeHasher,
      emailSender: this.emailSender,
    });

    return { message: "We sent you a new verification code" };
  }
}
