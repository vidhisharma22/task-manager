/**
 * components/TaskList.jsx
 * Renders the list of tasks with drag-and-drop reordering via @dnd-kit/sortable.
 */

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useTasks } from "../context/TaskContext";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

export default function TaskList({ onEdit, onDelete }) {
  const { tasks, filter, search, loading, toggleTask, reorderTasks } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    reorderTasks(reordered);
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="loading-list" role="status" aria-live="polite">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return <EmptyState filter={filter} isSearching={Boolean(search)} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list" role="list" aria-label="Task list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={toggleTask}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
