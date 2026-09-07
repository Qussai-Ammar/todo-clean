import { OtpCode } from "./otp-code.entity";

export interface OtpCodeRepository {
  findByEmail(email: string): Promise<OtpCode | null>;
  save(otpCode: OtpCode): Promise<void>;
  delete(email: string): Promise<void>;
}
