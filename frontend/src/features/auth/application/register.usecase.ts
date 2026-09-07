import { AuthApi, RegisterInput, RegisterResult } from "./ports/auth-api.js";

export class RegisterUseCase {
  constructor(private readonly authApi: AuthApi) {}

  execute(input: RegisterInput): Promise<RegisterResult> {
    return this.authApi.register(input);
  }
}
