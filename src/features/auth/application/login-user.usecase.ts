import { UnauthorizedError } from "../../../shared/domain/errors/app-error";
import { UserRepository } from "../domain/user.repository";
import { PasswordHasher } from "./ports/password-hasher";
import { TokenService } from "./ports/token-service";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: { id: string; name: string; email: string };
  token: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.tokenService.sign({ userId: user.id, email: user.email });

    return { user: user.toPublic(), token };
  }
}
