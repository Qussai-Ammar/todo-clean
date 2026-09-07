import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp, registerUser } from "./helpers";

describe("auth feature", () => {
  it("registers a new user and returns a token", async () => {
    const app = buildTestApp();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects registration with a short password", async () => {
    const app = buildTestApp();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "short" });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate email registration", async () => {
    const app = buildTestApp();
    await registerUser(app, { email: "dup@example.com" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Someone Else", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    const app = buildTestApp();
    await registerUser(app, { email: "login@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects login with wrong password", async () => {
    const app = buildTestApp();
    await registerUser(app, { email: "wrongpass@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrongpass@example.com", password: "nope12345" });

    expect(res.status).toBe(401);
  });

  it("rejects requests without a bearer token on protected routes", async () => {
    const app = buildTestApp();
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });
});
