/**
 * components/TaskCard.jsx
 * Renders a single task row. Supports drag-and-drop via @dnd-kit/sortable.
 */

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isOverdue, formatDate } from "../utils/date";

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const overdue = task.status === "active" && isOverdue(task.due_date);
  const [toggling, setToggling] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  async function handleToggle() {
    setToggling(true);
    await onToggle(task.id);
    setToggling(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.status === "completed" ? "task-done" : ""} ${overdue ? "task-overdue" : ""} ${isDragging ? "task-dragging" : ""}`}
      role="listitem"
    >
      {/* Drag handle */}
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        ⠿
      </button>

      {/* Checkbox */}
      <button
        className={`checkbox ${task.status === "completed" ? "checkbox-done" : ""} ${toggling ? "checkbox-spinning" : ""}`}
        onClick={handleToggle}
        aria-label={task.status === "completed" ? "Mark as active" : "Mark as complete"}
        disabled={toggling}
      >
        {task.status === "completed" && (
          <svg viewBox="0 0 12 12" fill="none" className="check-icon">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="task-content">
        <span className={`task-title ${task.status === "completed" ? "task-title-done" : ""}`}>
          {task.title}
        </span>
        {task.description && (
          <span className="task-desc">{task.description}</span>
        )}
        {task.due_date && (
          <span className={`task-due ${overdue ? "task-due-overdue" : ""}`}>
            {overdue ? "⚠ Overdue · " : "📅 "}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="task-actions">
        <button
          className="action-btn"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="action-btn action-btn-delete"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
