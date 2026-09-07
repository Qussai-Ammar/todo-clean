import { AuthUser } from "../../domain/session.js";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  email: string;
  message: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface AuthApi {
  register(input: RegisterInput): Promise<RegisterResult>;
  verifyOtp(input: VerifyOtpInput): Promise<AuthResult>;
  resendOtp(email: string): Promise<{ message: string }>;
  login(input: LoginInput): Promise<AuthResult>;
}
