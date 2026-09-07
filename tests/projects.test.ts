import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp, createProject, registerUser } from "./helpers";

describe("projects feature", () => {
  it("creates a project owned by the authenticated user", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "Roadmap", description: "2026 roadmap" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Roadmap");
    expect(res.body.ownerId).toBe(owner.id);
  });

  it("lists only projects the user owns or was invited to", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const stranger = await registerUser(app);
    await createProject(app, owner.token, { name: "Private" });

    const res = await request(app).get("/api/projects").set("Authorization", `Bearer ${stranger.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("updates a project's name", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const project = await createProject(app, owner.token, { name: "Old Name" });

    const res = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New Name");
  });

  it("prevents a non-collaborator from viewing a project", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const stranger = await registerUser(app);
    const project = await createProject(app, owner.token);

    const res = await request(app)
      .get(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });

  it("only lets the owner delete the project", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const other = await registerUser(app);
    const project = await createProject(app, owner.token);

    const deniedRes = await request(app)
      .delete(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(deniedRes.status).toBe(403);

    const okRes = await request(app)
      .delete(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(okRes.status).toBe(204);
  });
});
