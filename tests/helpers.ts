import request from "supertest";
import { Express } from "express";
import { createApp } from "../src/app";

export function buildTestApp(): Express {
  return createApp("test-secret");
}

export async function registerUser(
  app: Express,
  overrides: Partial<{ name: string; email: string; password: string }> = {}
): Promise<{ token: string; id: string; email: string }> {
  const payload = {
    name: overrides.name ?? "Test User",
    email: overrides.email ?? `user-${Math.random().toString(36).slice(2)}@example.com`,
    password: overrides.password ?? "password123",
  };

  const res = await request(app).post("/api/auth/register").send(payload);
  return { token: res.body.token, id: res.body.user.id, email: res.body.user.email };
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
