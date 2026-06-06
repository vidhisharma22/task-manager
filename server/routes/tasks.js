/**
 * routes/tasks.js
 * All task-related REST endpoints.
 *
 * GET    /api/tasks          – list tasks (filter by status / search)
 * POST   /api/tasks          – create a task
 * GET    /api/tasks/:id      – get a single task
 * PUT    /api/tasks/:id      – update a task
 * DELETE /api/tasks/:id      – delete a task
 * PATCH  /api/tasks/:id/toggle – toggle complete / active
 * POST   /api/tasks/reorder  – update position of all tasks (drag-and-drop)
 */

const express = require("express");
const { body, query, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const db = require("../database");

const router = express.Router();

// ─── helpers ────────────────────────────────────────────────────────────────

/** Send a 422 with validation errors if the request failed validation. */
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return true;
  }
  return false;
}

function now() {
  return new Date().toISOString();
}

// ─── GET /api/tasks ──────────────────────────────────────────────────────────

/**
 * Query params:
 *   status  – "all" | "active" | "completed"  (default: "all")
 *   search  – full-text search on title
 */
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["all", "active", "completed"])
      .withMessage('status must be "all", "active", or "completed"'),
  ],
  (req, res) => {
    if (handleValidation(req, res)) return;

    const { status = "all", search = "" } = req.query;

    let sql = "SELECT * FROM tasks WHERE 1=1";
    const params = [];

    if (status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }

    if (search.trim()) {
      sql += " AND LOWER(title) LIKE ?";
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    sql += " ORDER BY position ASC, created_at DESC";

    const tasks = db.prepare(sql).all(...params);

    // Summary counts (always over all tasks, not the filtered subset)
    const counts = db
      .prepare(
        "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
      )
      .all();

    const summary = { active: 0, completed: 0 };
    counts.forEach(({ status: s, count }) => {
      summary[s] = count;
    });
    summary.total = summary.active + summary.completed;

    res.json({ tasks, summary });
  }
);

// ─── POST /api/tasks ─────────────────────────────────────────────────────────

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional({ nullable: true }).isString(),
    body("due_date")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("due_date must be a valid ISO 8601 date"),
  ],
  (req, res) => {
    if (handleValidation(req, res)) return;

    const { title, description = null, due_date = null } = req.body;

    // New tasks go to the top (position 0), shift everything else down
    db.prepare("UPDATE tasks SET position = position + 1").run();

    const task = {
      id: uuidv4(),
      title: title.trim(),
      description: description ? description.trim() : null,
      due_date: due_date || null,
      status: "active",
      position: 0,
      created_at: now(),
      updated_at: now(),
    };

    db.prepare(`
      INSERT INTO tasks (id, title, description, due_date, status, position, created_at, updated_at)
      VALUES (@id, @title, @description, @due_date, @status, @position, @created_at, @updated_at)
    `).run(task);

    res.status(201).json(task);
  }
);

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────

router.get("/:id", (req, res) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────

router.put(
  "/:id",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional({ nullable: true }).isString(),
    body("due_date")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("due_date must be a valid ISO 8601 date"),
    body("status")
      .optional()
      .isIn(["active", "completed"])
      .withMessage('status must be "active" or "completed"'),
  ],
  (req, res) => {
    if (handleValidation(req, res)) return;

    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const {
      title = existing.title,
      description = existing.description,
      due_date = existing.due_date,
      status = existing.status,
    } = req.body;

    const updated = {
      title: title.trim(),
      description: description ? description.trim() : null,
      due_date: due_date || null,
      status,
      updated_at: now(),
      id: req.params.id,
    };

    db.prepare(`
      UPDATE tasks
      SET title = @title, description = @description, due_date = @due_date,
          status = @status, updated_at = @updated_at
      WHERE id = @id
    `).run(updated);

    res.json({ ...existing, ...updated });
  }
);

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────

router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ message: "Task deleted", id: req.params.id });
});

// ─── PATCH /api/tasks/:id/toggle ────────────────────────────────────────────

router.patch("/:id/toggle", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const newStatus = existing.status === "active" ? "completed" : "active";
  const updated_at = now();

  db.prepare(
    "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?"
  ).run(newStatus, updated_at, req.params.id);

  res.json({ ...existing, status: newStatus, updated_at });
});

// ─── POST /api/tasks/reorder ─────────────────────────────────────────────────

/**
 * Body: { orderedIds: string[] }
 * Updates the `position` column so the list reflects the drag-and-drop order.
 */
router.post("/reorder", (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(422).json({ error: "orderedIds must be a non-empty array" });
  }

  const update = db.prepare(
    "UPDATE tasks SET position = ?, updated_at = ? WHERE id = ?"
  );

  const reorderAll = db.transaction((ids) => {
    ids.forEach((id, index) => {
      update.run(index, now(), id);
    });
  });

  reorderAll(orderedIds);
  res.json({ message: "Order updated" });
});

module.exports = router;
