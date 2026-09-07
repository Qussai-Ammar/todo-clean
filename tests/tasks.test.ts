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

describe("tasks feature", () => {
  it("creates a task under a project in the todo column at position 0", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const project = await createProject(app, owner.token);

    const res = await createTask(app, owner.token, project.id, "First task");

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("todo");
    expect(res.body.position).toBe(0);
  });

  it("lists tasks scoped to a single project", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const projectA = await createProject(app, owner.token, { name: "A" });
    const projectB = await createProject(app, owner.token, { name: "B" });
    await createTask(app, owner.token, projectA.id, "Task A1");
    await createTask(app, owner.token, projectB.id, "Task B1");

    const res = await request(app)
      .get(`/api/tasks/project/${projectA.id}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Task A1");
  });

  it("moves a task to a new status column", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const project = await createProject(app, owner.token);
    const task = (await createTask(app, owner.token, project.id, "Move me")).body;

    const res = await request(app)
      .patch(`/api/tasks/${task.id}/move`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ status: "done", position: 0 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  it("rejects task creation from a user with no project access", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const stranger = await registerUser(app);
    const project = await createProject(app, owner.token);

    const res = await createTask(app, stranger.token, project.id, "Should fail");
    expect(res.status).toBe(403);
  });

  it("deletes a task", async () => {
    const app = buildTestApp();
    const owner = await registerUser(app);
    const project = await createProject(app, owner.token);
    const task = (await createTask(app, owner.token, project.id, "Delete me")).body;

    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(res.status).toBe(204);

    const listRes = await request(app)
      .get(`/api/tasks/project/${project.id}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(listRes.body).toHaveLength(0);
  });
});
