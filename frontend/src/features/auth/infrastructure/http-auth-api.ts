import { HttpClient } from "../../../shared/http-client.js";
import {
  AuthApi,
  AuthResult,
  LoginInput,
  RegisterInput,
  RegisterResult,
  VerifyOtpInput,
} from "../application/ports/auth-api.js";

export class HttpAuthApi implements AuthApi {
  constructor(private readonly http: HttpClient) {}

  register(input: RegisterInput): Promise<RegisterResult> {
    return this.http.post<RegisterResult>("/auth/register", input);
  }

  verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
    return this.http.post<AuthResult>("/auth/verify-otp", input);
  }

  resendOtp(email: string): Promise<{ message: string }> {
    return this.http.post<{ message: string }>("/auth/resend-otp", { email });
  }

  login(input: LoginInput): Promise<AuthResult> {
    return this.http.post<AuthResult>("/auth/login", input);
  }
}
