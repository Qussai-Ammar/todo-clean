import { Session } from "../domain/session.js";
import { AuthApi, LoginInput } from "./ports/auth-api.js";
import { SessionStore } from "./ports/session-store.js";

export class LoginUseCase {
  constructor(
    private readonly authApi: AuthApi,
    private readonly sessionStore: SessionStore
  ) {}

  async execute(input: LoginInput): Promise<Session> {
    const result = await this.authApi.login(input);
    this.sessionStore.set(result);
    return result;
  }
}
