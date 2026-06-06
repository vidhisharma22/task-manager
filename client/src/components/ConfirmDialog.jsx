/**
 * components/ConfirmDialog.jsx
 * Modal confirmation dialog used before deleting a task.
 */

import React, { useEffect } from "react";

export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon">🗑️</div>
        <h3 id="confirm-title" className="dialog-title">Delete Task?</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} autoFocus>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
