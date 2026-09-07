import { generateId } from "../../../shared/domain/entity-id";
import { ConflictError, ValidationError } from "../../../shared/domain/errors/app-error";
import { User } from "../domain/user.entity";
import { UserRepository } from "../domain/user.repository";
import { OtpCodeRepository } from "../domain/otp-code.repository";
import { issueAndSendOtp } from "./issue-otp";
import { EmailSender } from "./ports/email-sender";
import { PasswordHasher } from "./ports/password-hasher";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  email: string;
  message: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpCodeRepository: OtpCodeRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailSender: EmailSender
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = input.email.trim().toLowerCase();

    if (input.password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: generateId(),
      name: input.name.trim(),
      email,
      passwordHash,
      isVerified: false,
      createdAt: new Date(),
    });

    await this.userRepository.save(user);
    await issueAndSendOtp(email, {
      otpCodeRepository: this.otpCodeRepository,
      codeHasher: this.passwordHasher,
      emailSender: this.emailSender,
    });

    return { email, message: "We sent a 6-digit verification code to your email" };
  }
}
