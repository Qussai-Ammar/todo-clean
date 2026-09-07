import { generateId } from "../../../shared/domain/entity-id";
import { ConflictError, ValidationError } from "../../../shared/domain/errors/app-error";
import { User } from "../domain/user.entity";
import { UserRepository } from "../domain/user.repository";
import { PasswordHasher } from "./ports/password-hasher";
import { TokenService } from "./ports/token-service";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  user: { id: string; name: string; email: string };
  token: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
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
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    const token = this.tokenService.sign({ userId: user.id, email: user.email });

    return { user: user.toPublic(), token };
  }
}
