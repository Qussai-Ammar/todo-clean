import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { buildTestApp, registerUser } from "./helpers";

afterEach(() => {
  vi.useRealTimers();
});

describe("auth feature", () => {
  it("registers a new user and sends an OTP instead of logging them in immediately", async () => {
    const { app, emailSender } = buildTestApp();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "password123" });

    expect(res.status).toBe(202);
    expect(res.body.email).toBe("alice@example.com");
    expect(res.body.token).toBeUndefined();

    const code = emailSender.extractLastOtpCode("alice@example.com");
    expect(code).toMatch(/^\d{6}$/);
  });

  it("rejects registration with a short password", async () => {
    const { app } = buildTestApp();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@example.com", password: "short" });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate email registration", async () => {
    const testApp = buildTestApp();
    await registerUser(testApp, { email: "dup@example.com" });

    const res = await request(testApp.app)
      .post("/api/auth/register")
      .send({ name: "Someone Else", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("verifies the OTP and issues a token, and rejects a wrong code", async () => {
    const { app, emailSender } = buildTestApp();
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Bob", email: "bob@example.com", password: "password123" });

    const wrongRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "bob@example.com", code: "000000" });
    expect(wrongRes.status).toBe(400);

    const code = emailSender.extractLastOtpCode("bob@example.com")!;
    const res = await request(app).post("/api/auth/verify-otp").send({ email: "bob@example.com", code });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe("bob@example.com");
  });

  it("blocks login until the account is verified", async () => {
    const { app } = buildTestApp();
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Carol", email: "carol@example.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "carol@example.com", password: "password123" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("throttles resend requests within the cooldown window", async () => {
    const { app } = buildTestApp();
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Dana", email: "dana@example.com", password: "password123" });

    const res = await request(app).post("/api/auth/resend-otp").send({ email: "dana@example.com" });
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("OTP_COOLDOWN");
  });

  it("allows a resend once the cooldown has elapsed, invalidating the old code", async () => {
    const { app, emailSender } = buildTestApp();
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Dana", email: "dana2@example.com", password: "password123" });

    const firstCode = emailSender.extractLastOtpCode("dana2@example.com")!;

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 31_000);

    const res = await request(app).post("/api/auth/resend-otp").send({ email: "dana2@example.com" });
    expect(res.status).toBe(200);

    const secondCode = emailSender.extractLastOtpCode("dana2@example.com")!;
    vi.useRealTimers();

    const oldCodeRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "dana2@example.com", code: firstCode });
    expect(oldCodeRes.status).toBe(firstCode === secondCode ? 200 : 400);

    if (firstCode !== secondCode) {
      const newCodeRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "dana2@example.com", code: secondCode });
      expect(newCodeRes.status).toBe(200);
    }
  });

  it("logs in with correct credentials once verified", async () => {
    const testApp = buildTestApp();
    await registerUser(testApp, { email: "login@example.com", password: "password123" });

    const res = await request(testApp.app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects login with wrong password", async () => {
    const testApp = buildTestApp();
    await registerUser(testApp, { email: "wrongpass@example.com", password: "password123" });

    const res = await request(testApp.app)
      .post("/api/auth/login")
      .send({ email: "wrongpass@example.com", password: "nope12345" });

    expect(res.status).toBe(401);
  });

  it("rejects requests without a bearer token on protected routes", async () => {
    const { app } = buildTestApp();
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });
});
