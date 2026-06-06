/**
 * routes/tasks.test.js
 * Meaningful integration tests for the task API using supertest.
 * Uses an in-memory SQLite database via the app's database module.
 */

const request = require("supertest");
const app = require("../index");
const db = require("../database");

// Clean up the tasks table before each test so tests are isolated
beforeEach(() => {
  db.prepare("DELETE FROM tasks").run();
});

afterAll(() => {
  db.close();
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────

describe("POST /api/tasks", () => {
  it("creates a task with only a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Buy milk" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Buy milk");
    expect(res.body.status).toBe("active");
    expect(res.body.id).toBeDefined();
  });

  it("creates a task with title, description, and due_date", async () => {
    const res = await request(app).post("/api/tasks").send({
      title: "Finish assessment",
      description: "Studio Graphene take-home",
      due_date: "2025-12-31",
    });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Studio Graphene take-home");
    expect(res.body.due_date).toBe("2025-12-31");
  });

  it("returns 422 when title is missing", async () => {
    const res = await request(app).post("/api/tasks").send({});
    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });
});

// ─── GET /api/tasks ──────────────────────────────────────────────────────────

describe("GET /api/tasks", () => {
  it("returns all tasks with summary counts", async () => {
    await request(app).post("/api/tasks").send({ title: "Task A" });
    await request(app).post("/api/tasks").send({ title: "Task B" });

    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.summary.total).toBe(2);
  });

  it("filters by status=active", async () => {
    const { body: task } = await request(app)
      .post("/api/tasks")
      .send({ title: "Active task" });

    await request(app).patch(`/api/tasks/${task.id}/toggle`); // now completed

    await request(app).post("/api/tasks").send({ title: "Another active task" });

    const res = await request(app).get("/api/tasks?status=active");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("Another active task");
  });

  it("filters tasks by search query", async () => {
    await request(app).post("/api/tasks").send({ title: "Buy groceries" });
    await request(app).post("/api/tasks").send({ title: "Write tests" });

    const res = await request(app).get("/api/tasks?search=groceries");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("Buy groceries");
  });
});

// ─── PATCH /api/tasks/:id/toggle ────────────────────────────────────────────

describe("PATCH /api/tasks/:id/toggle", () => {
  it("toggles task from active to completed and back", async () => {
    const { body: task } = await request(app)
      .post("/api/tasks")
      .send({ title: "Toggle me" });

    const toggled = await request(app).patch(`/api/tasks/${task.id}/toggle`);
    expect(toggled.body.status).toBe("completed");

    const toggledBack = await request(app).patch(`/api/tasks/${task.id}/toggle`);
    expect(toggledBack.body.status).toBe("active");
  });
});

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task and returns 404 on subsequent fetch", async () => {
    const { body: task } = await request(app)
      .post("/api/tasks")
      .send({ title: "Delete me" });

    const del = await request(app).delete(`/api/tasks/${task.id}`);
    expect(del.status).toBe(200);

    const get = await request(app).get(`/api/tasks/${task.id}`);
    expect(get.status).toBe(404);
  });
});
