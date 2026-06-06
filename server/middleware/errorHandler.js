/**
 * middleware/errorHandler.js
 * Centralised error handler — catches anything thrown in route handlers.
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("[ErrorHandler]", err);

  // SQLite-specific errors
  if (err.code && err.code.startsWith("SQLITE_")) {
    return res.status(500).json({ error: "Database error", detail: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
