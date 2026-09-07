import { Session } from "../domain/session.js";
import { AuthApi, VerifyOtpInput } from "./ports/auth-api.js";
import { SessionStore } from "./ports/session-store.js";

export class VerifyOtpUseCase {
  constructor(
    private readonly authApi: AuthApi,
    private readonly sessionStore: SessionStore
  ) {}

  async execute(input: VerifyOtpInput): Promise<Session> {
    const result = await this.authApi.verifyOtp(input);
    this.sessionStore.set(result);
    return result;
  }
}
