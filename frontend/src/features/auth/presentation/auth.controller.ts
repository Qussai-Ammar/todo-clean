import { ApiError } from "../../../shared/http-client.js";
import { ToastManager } from "../../../shared/toast.js";
import { LoginUseCase } from "../application/login.usecase.js";
import { RegisterUseCase } from "../application/register.usecase.js";
import { ResendOtpUseCase } from "../application/resend-otp.usecase.js";
import { VerifyOtpUseCase } from "../application/verify-otp.usecase.js";
import { renderAuthShell } from "./auth-shell.js";
import { buildLoginForm } from "./login-view.js";
import { buildOtpForm } from "./otp-view.js";
import { buildRegisterForm } from "./register-view.js";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly toast: ToastManager,
    private readonly navigate: (path: string) => void
  ) {}

  renderLogin(container: HTMLElement): void {
    renderAuthShell(container, {
      heading: "Welcome back",
      subheading: "Log in to keep your projects moving.",
      body: buildLoginForm({
        onNavigateRegister: () => this.navigate("/register"),
        onSubmit: async (email, password) => {
          try {
            await this.loginUseCase.execute({ email, password });
            this.toast.success("Welcome back!");
            this.navigate("/projects");
          } catch (err) {
            if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
              this.toast.info("Verify your email to finish signing in.");
              this.navigate(`/verify/${encodeURIComponent(email)}`);
              return;
            }
            throw err;
          }
        },
      }),
    });
  }

  renderRegister(container: HTMLElement): void {
    renderAuthShell(container, {
      heading: "Create your account",
      subheading: "Free, no credit card — just your email.",
      body: buildRegisterForm({
        onNavigateLogin: () => this.navigate("/login"),
        onSubmit: async (name, email, password) => {
          await this.registerUseCase.execute({ name, email, password });
          this.toast.success("Check your email for a verification code.");
          this.navigate(`/verify/${encodeURIComponent(email)}`);
        },
      }),
    });
  }

  renderVerify(container: HTMLElement, email: string): void {
    renderAuthShell(container, {
      heading: "Check your email",
      subheading: `Enter the 6-digit code we sent to ${email}.`,
      body: buildOtpForm({
        email,
        onBack: () => this.navigate("/register"),
        onSubmit: async (code) => {
          await this.verifyOtpUseCase.execute({ email, code });
          this.toast.success("Email verified — welcome aboard!");
          this.navigate("/projects");
        },
        onResend: async () => {
          const result = await this.resendOtpUseCase.execute(email);
          this.toast.success(result.message);
        },
      }),
    });
  }
}
