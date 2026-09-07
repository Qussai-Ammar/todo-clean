import { OtpCode } from "../domain/otp-code.entity";
import { OtpCodeRepository } from "../domain/otp-code.repository";

export class InMemoryOtpCodeRepository implements OtpCodeRepository {
  private readonly otpsByEmail = new Map<string, OtpCode>();

  async findByEmail(email: string): Promise<OtpCode | null> {
    return this.otpsByEmail.get(email) ?? null;
  }

  async save(otpCode: OtpCode): Promise<void> {
    this.otpsByEmail.set(otpCode.email, otpCode);
  }

  async delete(email: string): Promise<void> {
    this.otpsByEmail.delete(email);
  }
}
