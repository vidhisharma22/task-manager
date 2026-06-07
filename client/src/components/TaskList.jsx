import React from "react";
import { useTasks } from "../context/TaskContext";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <p className="empty-state">Loading...</p>;
  if (error) return <p className="empty-state">Error: {error}</p>;
  if (!tasks.length) return <p className="empty-state">No tasks yet. Add one!</p>;

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}