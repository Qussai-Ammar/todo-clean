import { describe, expect, it } from "vitest";
import request from "supertest";
import { Express } from "express";
import { buildTestApp, createProject, registerUser } from "./helpers";

async function createTask(app: Express, token: string, projectId: string, title: string) {
  return request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({ projectId, title });
}

describe("views feature", () => {
  it("returns a flat, status-ordered list view", async () => {
    const testApp = buildTestApp();
    const app = testApp.app;
    const owner = await registerUser(testApp);
    const project = await createProject(app, owner.token);
    const taskA = (await createTask(app, owner.token, project.id, "A")).body;
    await createTask(app, owner.token, project.id, "B");
    await request(app)
      .patch(`/api/tasks/${taskA.id}/move`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "done", position: 0 });

    const res = await request(app)
      .get(`/api/views/${project.id}/list`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.map((t: { title: string }) => t.title)).toEqual(["B", "A"]);
  });

  it("returns a kanban view grouped by column", async () => {
    const testApp = buildTestApp();
    const app = testApp.app;
    const owner = await registerUser(testApp);
    const project = await createProject(app, owner.token);
    await createTask(app, owner.token, project.id, "Todo task");

    const res = await request(app)
      .get(`/api/views/${project.id}/kanban`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body.columns.map((c: { status: string }) => c.status)).toEqual(["todo", "in_progress", "done"]);
    expect(res.body.columns[0].tasks).toHaveLength(1);
  });

  it("denies views to users without project access", async () => {
    const testApp = buildTestApp();
    const app = testApp.app;
    const owner = await registerUser(testApp);
    const stranger = await registerUser(testApp);
    const project = await createProject(app, owner.token);

    const res = await request(app)
      .get(`/api/views/${project.id}/kanban`)
      .set("Authorization", `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });
});
