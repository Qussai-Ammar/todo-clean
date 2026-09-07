import request from "supertest";
import { Express } from "express";
import { createApp } from "../src/app";
import { RecordingEmailSender } from "../src/features/auth";

export interface TestApp {
  app: Express;
  emailSender: RecordingEmailSender;
}

export function buildTestApp(): TestApp {
  const emailSender = new RecordingEmailSender();
  const app = createApp({ jwtSecret: "test-secret", emailSender });
  return { app, emailSender };
}

export async function registerUser(
  testApp: TestApp,
  overrides: Partial<{ name: string; email: string; password: string }> = {}
): Promise<{ token: string; id: string; email: string }> {
  const { app, emailSender } = testApp;
  const payload = {
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `user-${Math.random().toString(36).slice(2)}@example.com`,
    password: overrides.password ?? "password123",
  };

  await request(app).post("/api/auth/register").send(payload);

  const code = emailSender.extractLastOtpCode(payload.email);
  if (!code) {
    throw new Error(`No OTP code was sent to ${payload.email}`);
  }

  const verifyRes = await request(app)
    .post("/api/auth/verify-otp")
    .send({ email: payload.email, code });

  return { token: verifyRes.body.token, id: verifyRes.body.user.id, email: verifyRes.body.user.email };
}

export async function createProject(
  app: Express,
  token: string,
  overrides: Partial<{ name: string; description: string }> = {}
): Promise<{ id: string }> {
  const res = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: overrides.name ?? "Test Project", description: overrides.description ?? "" });
  return { id: res.body.id };
}
