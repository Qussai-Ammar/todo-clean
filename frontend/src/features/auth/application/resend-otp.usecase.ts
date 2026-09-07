import { AuthApi } from "./ports/auth-api.js";

export class ResendOtpUseCase {
  constructor(private readonly authApi: AuthApi) {}

  execute(email: string): Promise<{ message: string }> {
    return this.authApi.resendOtp(email);
  }
}
