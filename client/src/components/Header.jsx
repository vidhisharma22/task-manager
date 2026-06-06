/**
 * components/Header.jsx
 * App header with logo, summary counts, filter tabs, and search bar.
 */

import React from "react";
import { useTasks } from "../context/TaskContext";

export default function Header({ onNewTask }) {
  const { filter, setFilter, search, setSearch, summary } = useTasks();

  const tabs = [
    { key: "all", label: "All", count: summary.total },
    { key: "active", label: "Active", count: summary.active },
    { key: "completed", label: "Done", count: summary.completed },
  ];

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="header-brand">
        <div className="brand-mark">TF</div>
        <div>
          <h1 className="brand-name">TaskFlow</h1>
          <p className="brand-sub">Personal Task Manager</p>
        </div>
      </div>

      {/* Summary pill */}
      <div className="summary-pills">
        <span className="pill pill-active">{summary.active} active</span>
        <span className="pill pill-done">{summary.completed} done</span>
      </div>

      {/* Toolbar row */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* New task button */}
        <button className="btn btn-primary btn-new" onClick={onNewTask}>
          <span aria-hidden="true">+</span> New Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            className={`filter-tab ${filter === key ? "filter-tab-active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="tab-count">{count}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
