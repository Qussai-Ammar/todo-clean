import { HttpClient } from "../../shared/http-client.js";
import { ToastManager } from "../../shared/toast.js";
import { GetSessionUseCase } from "./application/get-session.usecase.js";
import { LoginUseCase } from "./application/login.usecase.js";
import { LogoutUseCase } from "./application/logout.usecase.js";
import { RegisterUseCase } from "./application/register.usecase.js";
import { ResendOtpUseCase } from "./application/resend-otp.usecase.js";
import { VerifyOtpUseCase } from "./application/verify-otp.usecase.js";
import { SessionStore } from "./application/ports/session-store.js";
import { HttpAuthApi } from "./infrastructure/http-auth-api.js";
import { LocalStorageSessionStore } from "./infrastructure/local-storage-session-store.js";
import { AuthController } from "./presentation/auth.controller.js";

export interface AuthFeature {
  controller: AuthController;
  sessionStore: SessionStore;
  getSessionUseCase: GetSessionUseCase;
  logoutUseCase: LogoutUseCase;
}

export function createAuthFeature(deps: {
  http: HttpClient;
  toast: ToastManager;
  navigate: (path: string) => void;
}): AuthFeature {
  const authApi = new HttpAuthApi(deps.http);
  const sessionStore = new LocalStorageSessionStore();

  const registerUseCase = new RegisterUseCase(authApi);
  const verifyOtpUseCase = new VerifyOtpUseCase(authApi, sessionStore);
  const resendOtpUseCase = new ResendOtpUseCase(authApi);
  const loginUseCase = new LoginUseCase(authApi, sessionStore);
  const logoutUseCase = new LogoutUseCase(sessionStore);
  const getSessionUseCase = new GetSessionUseCase(sessionStore);

  const controller = new AuthController(
    registerUseCase,
    verifyOtpUseCase,
    resendOtpUseCase,
    loginUseCase,
    deps.toast,
    deps.navigate
  );

  return { controller, sessionStore, getSessionUseCase, logoutUseCase };
}

export type { AuthUser, Session } from "./domain/session.js";
export type { SessionStore } from "./application/ports/session-store.js";
