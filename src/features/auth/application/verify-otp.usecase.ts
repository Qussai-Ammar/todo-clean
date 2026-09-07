import { NotFoundError } from "../../../shared/domain/errors/app-error";
import { InvalidOtpError } from "../domain/auth-errors";
import { OtpCodeRepository } from "../domain/otp-code.repository";
import { UserRepository } from "../domain/user.repository";
import { PasswordHasher } from "./ports/password-hasher";
import { TokenService } from "./ports/token-service";

export interface VerifyOtpInput {
  email: string;
  code: string;
}

export interface VerifyOtpOutput {
  user: { id: string; name: string; email: string };
  token: string;
}

export class VerifyOtpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpCodeRepository: OtpCodeRepository,
    private readonly codeHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
    const email = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Account");
    }

    const otp = await this.otpCodeRepository.findByEmail(email);
    if (!otp || otp.isExpired(new Date())) {
      throw new InvalidOtpError();
    }

    if (otp.hasTooManyAttempts()) {
      throw new InvalidOtpError("Too many attempts. Request a new code.");
    }

    const matches = await this.codeHasher.compare(input.code.trim(), otp.codeHash);
    if (!matches) {
      otp.registerFailedAttempt();
      await this.otpCodeRepository.save(otp);
      throw new InvalidOtpError();
    }

    user.markVerified();
    await this.userRepository.save(user);
    await this.otpCodeRepository.delete(email);

    const token = this.tokenService.sign({ userId: user.id, email: user.email });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }
}
