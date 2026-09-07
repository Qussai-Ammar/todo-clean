import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp, createProject, registerUser } from "./helpers";

describe("collaboration feature", () => {
  it("lets the owner invite a collaborator by email", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const bob = await registerUser(app, { email: "bob@example.com" });
    const project = await createProject(app, owner.token);

    const res = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: bob.email, role: "editor" });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(bob.id);
    expect(res.body.role).toBe("editor");
  });

  it("prevents a non-owner from inviting collaborators", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const other = await registerUser(app);
    const bob = await registerUser(app, { email: "bob2@example.com" });
    const project = await createProject(app, owner.token);

    const res = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ email: bob.email, role: "editor" });

    expect(res.status).toBe(403);
  });

  it("gives a viewer read access but not write access", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const viewer = await registerUser(app, { email: "viewer@example.com" });
    const project = await createProject(app, owner.token);

    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: viewer.email, role: "viewer" });

    const readRes = await request(app)
      .get(`/api/projects/${project.id}`)
      .set("Authorization", `Bearer ${viewer.token}`);
    expect(readRes.status).toBe(200);

    const writeRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${viewer.token}`)
      .send({ projectId: project.id, title: "Should be denied" });
    expect(writeRes.status).toBe(403);
  });

  it("lets the owner change a collaborator's role", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const bob = await registerUser(app, { email: "bob3@example.com" });
    const project = await createProject(app, owner.token);

    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: bob.email, role: "viewer" });

    const res = await request(app)
      .patch(`/api/projects/${project.id}/members/${bob.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "editor" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("editor");
  });

  it("lets a member remove themselves from a project", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const bob = await registerUser(app, { email: "bob4@example.com" });
    const project = await createProject(app, owner.token);

    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: bob.email, role: "editor" });

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/${bob.id}`)
      .set("Authorization", `Bearer ${bob.token}`);

    expect(res.status).toBe(204);
  });
});
