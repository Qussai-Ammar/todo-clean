import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp, createProject, registerUser } from "./helpers";

describe("projects feature", () => {
  it("creates a project owned by the authenticated user", async () => {
    const testApp = buildTestApp();
    const owner = await registerUser(testApp);

    const res = await request(testApp.app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Roadmap", description: "2026 roadmap" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Roadmap");
    expect(res.body.ownerId).toBe(owner.id);
  });

  it("lists only projects the user owns or was invited to", async () => {
    const testApp = buildTestApp();
    const owner = await registerUser(testApp);
    const stranger = await registerUser(testApp);
    await createProject(testApp.app, owner.token, { name: "Private" });

    const res = await request(testApp.app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("updates a project's name", async () => {
    const testApp = buildTestApp();
    const owner = await registerUser(testApp);
    const project = await createProject(testApp.app, owner.token, { name: "Old Name" });

    const res = await request(testApp.app)
      .patch(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New Name");
  });

  it("prevents a non-collaborator from viewing a project", async () => {
    const testApp = buildTestApp();
    const owner = await registerUser(testApp);
    const stranger = await registerUser(testApp);
    const project = await createProject(testApp.app, owner.token);

    const res = await request(testApp.app)
      .get(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });

  it("only lets the owner delete the project", async () => {
    const testApp = buildTestApp();
    const owner = await registerUser(testApp);
    const other = await registerUser(testApp);
    const project = await createProject(testApp.app, owner.token);

    const deniedRes = await request(testApp.app)
      .delete(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(deniedRes.status).toBe(403);

    const okRes = await request(testApp.app)
      .delete(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(okRes.status).toBe(204);
  });
});
