/**
 * App.jsx
 * Root component. Wires up the TaskProvider, header, list, and all modals.
 */

import React, { useState } from "react";
import { TaskProvider } from "./context/TaskContext";
import Header from "./components/Header";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import ConfirmDialog from "./components/ConfirmDialog";
import { useConfirm } from "./hooks/useConfirm";
import { useTasks } from "./context/TaskContext";

function TaskApp() {
  const { deleteTask, error } = useTasks();
  const { confirmState, confirm, handleConfirm, handleCancel } = useConfirm();

  // Panel state: null = closed | "create" | task-object (edit mode)
  const [panel, setPanel] = useState(null);

  function openCreate() {
    setPanel("create");
  }

  function openEdit(task) {
    setPanel(task);
  }

  async function handleDelete(task) {
    const yes = await confirm(
      `"${task.title}" will be permanently deleted. This cannot be undone.`
    );
    if (yes) await deleteTask(task.id);
  }

  const isEditing = panel && panel !== "create";
  const isCreating = panel === "create";

  return (
    <div className="app">
      <Header onNewTask={openCreate} />

      <main className="main">
        {error && (
          <div className="error-banner" role="alert">
            ⚠ {error}
          </div>
        )}

        <TaskList onEdit={openEdit} onDelete={handleDelete} />
      </main>

      {/* Create / Edit panel */}
      {(isCreating || isEditing) && (
        <TaskForm
          task={isEditing ? panel : null}
          onClose={() => setPanel(null)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <TaskApp />
    </TaskProvider>
  );
}
