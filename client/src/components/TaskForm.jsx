/**
 * components/TaskForm.jsx
 * Slide-in panel for creating a new task or editing an existing one.
 * Props:
 *   task    – the task to edit (null → create mode)
 *   onClose – called when the panel should close
 */

import React, { useEffect, useRef, useState } from "react";
import { useTasks } from "../context/TaskContext";

const EMPTY = { title: "", description: "", due_date: "" };

export default function TaskForm({ task, onClose }) {
  const { createTask, updateTask } = useTasks();
  const isEdit = Boolean(task);

  const [form, setForm] = useState(
    isEdit
      ? {
          title: task.title,
          description: task.description || "",
          due_date: task.due_date ? task.due_date.slice(0, 10) : "",
        }
      : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  // Auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.due_date || null,
      };

      if (isEdit) {
        await updateTask(task.id, { ...payload, status: task.status });
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
    };
  }

  return (
    <div className="panel-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit task" : "New task"}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="panel-header">
          <h2 className="panel-title">{isEdit ? "Edit Task" : "New Task"}</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              className={`input ${errors.title ? "input-error" : ""}`}
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange("title")}
              maxLength={200}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="input input-textarea"
              placeholder="Add details (optional)"
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="task-due">
              Due Date
            </label>
            <input
              id="task-due"
              className="input"
              type="date"
              value={form.due_date}
              onChange={handleChange("due_date")}
            />
          </div>

          {errors.server && (
            <div className="server-error">{errors.server}</div>
          )}

          <div className="panel-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
