import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("A valid email is required"),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const resendOtpSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
