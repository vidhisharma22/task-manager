/**
 * index.js
 * Application entry point. Wires up Express middleware and mounts routes.
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const taskRoutes = require("./routes/tasks");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

// ─── Health check ────────────────────────────────────────────────────────────

app.get("/health", (_, res) => res.json({ status: "ok" }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/tasks", taskRoutes);

// ─── Error handler ───────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅  Task Manager API running on http://localhost:${PORT}`);
  });
}

module.exports = app; // exported for tests
