/**
 * utils/date.js
 * Lightweight date helpers — no external dependency needed.
 */

/** Returns true if the given ISO date string represents a past date (today counts as overdue only if the task is still active). */
export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  const due = new Date(dueDateStr);
  due.setHours(23, 59, 59, 999); // give full day
  return due < new Date();
}

/** Format an ISO date string to a human-readable short date. */
export function formatDate(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Return a relative label like "Today", "Yesterday", or the formatted date. */
export function relativeDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  const today = new Date();
  const diff = Math.floor(
    (today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(isoStr);
}
