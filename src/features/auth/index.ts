import { Router } from "express";
import { LoginUserUseCase } from "./application/login-user.usecase";
import { RegisterUserUseCase } from "./application/register-user.usecase";
import { TokenService } from "./application/ports/token-service";
import { UserRepository } from "./domain/user.repository";
import { BcryptPasswordHasher } from "./infrastructure/bcrypt-password-hasher";
import { InMemoryUserRepository } from "./infrastructure/in-memory-user.repository";
import { JwtTokenService } from "./infrastructure/jwt-token.service";
import { AuthController } from "./presentation/auth.controller";
import { createAuthRoutes } from "./presentation/auth.routes";

export interface AuthModule {
  routes: Router;
  userRepository: UserRepository;
  tokenService: TokenService;
}

export function createAuthModule(jwtSecret: string): AuthModule {
  const userRepository = new InMemoryUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(jwtSecret);

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

  const controller = new AuthController(registerUserUseCase, loginUserUseCase);
  const routes = createAuthRoutes(controller);

  return { routes, userRepository, tokenService };
}

export type { User } from "./domain/user.entity";
export type { UserRepository } from "./domain/user.repository";
export type { TokenService, AuthTokenPayload } from "./application/ports/token-service";
