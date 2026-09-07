import { Router } from "express";
import { LoginUserUseCase } from "./application/login-user.usecase";
import { RegisterUserUseCase } from "./application/register-user.usecase";
import { ResendOtpUseCase } from "./application/resend-otp.usecase";
import { VerifyOtpUseCase } from "./application/verify-otp.usecase";
import { EmailSender } from "./application/ports/email-sender";
import { TokenService } from "./application/ports/token-service";
import { OtpCodeRepository } from "./domain/otp-code.repository";
import { UserRepository } from "./domain/user.repository";
import { BcryptPasswordHasher } from "./infrastructure/bcrypt-password-hasher";
import { ConsoleEmailSender } from "./infrastructure/console-email-sender";
import { InMemoryOtpCodeRepository } from "./infrastructure/in-memory-otp-code.repository";
import { InMemoryUserRepository } from "./infrastructure/in-memory-user.repository";
import { JwtTokenService } from "./infrastructure/jwt-token.service";
import { SendGridEmailSender } from "./infrastructure/sendgrid-email-sender";
import { AuthController } from "./presentation/auth.controller";
import { createAuthRoutes } from "./presentation/auth.routes";

export interface AuthModuleConfig {
  jwtSecret: string;
  /** Override the email delivery adapter — mainly used by tests. */
  emailSender?: EmailSender;
}

export interface AuthModule {
  routes: Router;
  userRepository: UserRepository;
  tokenService: TokenService;
}

function resolveEmailSender(): EmailSender {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (apiKey && fromEmail) {
    return new SendGridEmailSender(apiKey, fromEmail);
  }

  console.warn(
    "[auth] SENDGRID_API_KEY / SENDGRID_FROM_EMAIL not set — verification emails will be logged " +
      "to the console instead of actually sent. Set both to enable real delivery via SendGrid."
  );
  return new ConsoleEmailSender();
}

export function createAuthModule(config: AuthModuleConfig): AuthModule {
  const userRepository = new InMemoryUserRepository();
  const otpCodeRepository: OtpCodeRepository = new InMemoryOtpCodeRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(config.jwtSecret);
  const emailSender = config.emailSender ?? resolveEmailSender();

  const registerUserUseCase = new RegisterUserUseCase(userRepository, otpCodeRepository, passwordHasher, emailSender);
  const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpCodeRepository, passwordHasher, tokenService);
  const resendOtpUseCase = new ResendOtpUseCase(userRepository, otpCodeRepository, passwordHasher, emailSender);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

  const controller = new AuthController(registerUserUseCase, loginUserUseCase, verifyOtpUseCase, resendOtpUseCase);
  const routes = createAuthRoutes(controller);

  return { routes, userRepository, tokenService };
}

export type { User } from "./domain/user.entity";
export type { UserRepository } from "./domain/user.repository";
export type { TokenService, AuthTokenPayload } from "./application/ports/token-service";
export type { EmailSender, EmailMessage } from "./application/ports/email-sender";
export { RecordingEmailSender } from "./infrastructure/recording-email-sender";
