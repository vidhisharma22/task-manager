/**
 * components/EmptyState.jsx
 * Friendly empty-state illustration shown when there are no tasks to display.
 */

import React from "react";

const MESSAGES = {
  all: {
    headline: "Nothing to do — nice!",
    sub: "Add a task above to get started.",
    icon: "✨",
  },
  active: {
    headline: "All caught up",
    sub: "No active tasks right now.",
    icon: "🎉",
  },
  completed: {
    headline: "No completed tasks yet",
    sub: "Finish a task and it will appear here.",
    icon: "🏁",
  },
  search: {
    headline: "No results found",
    sub: "Try a different search term.",
    icon: "🔍",
  },
};

export default function EmptyState({ filter, isSearching }) {
  const key = isSearching ? "search" : filter;
  const { headline, sub, icon } = MESSAGES[key] || MESSAGES.all;

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="empty-icon">{icon}</span>
      <h3 className="empty-headline">{headline}</h3>
      <p className="empty-sub">{sub}</p>
    </div>
  );
}
