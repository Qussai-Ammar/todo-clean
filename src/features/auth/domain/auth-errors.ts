import { AppError } from "../../../shared/domain/errors/app-error";

export class EmailNotVerifiedError extends AppError {
  constructor(email: string) {
    super(`Verify ${email} before logging in`, 403, "EMAIL_NOT_VERIFIED");
  }
}

export class InvalidOtpError extends AppError {
  constructor(message = "Invalid or expired verification code") {
    super(message, 400, "INVALID_OTP");
  }
}

export class OtpCooldownError extends AppError {
  constructor(secondsRemaining: number) {
    super(`Please wait ${secondsRemaining}s before requesting another code`, 429, "OTP_COOLDOWN");
  }
}
