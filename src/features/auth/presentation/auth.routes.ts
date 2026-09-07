import { Router } from "express";
import { asyncHandler } from "../../../shared/infrastructure/http/async-handler";
import { validateBody } from "../../../shared/infrastructure/http/validate";
import { AuthController } from "./auth.controller";
import { loginSchema, registerSchema, resendOtpSchema, verifyOtpSchema } from "./dtos";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validateBody(registerSchema), asyncHandler(controller.register));
  router.post("/verify-otp", validateBody(verifyOtpSchema), asyncHandler(controller.verifyOtp));
  router.post("/resend-otp", validateBody(resendOtpSchema), asyncHandler(controller.resendOtp));
  router.post("/login", validateBody(loginSchema), asyncHandler(controller.login));

  return router;
}
