/**
 * context/TaskContext.jsx
 * Provides tasks state and all mutating actions to the component tree.
 * Components call useTasks() to get everything they need.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { api } from "../utils/api";

// ─── State shape ─────────────────────────────────────────────────────────────

const initialState = {
  tasks: [],
  summary: { active: 0, completed: 0, total: 0 },
  filter: "all",         // "all" | "active" | "completed"
  search: "",
  loading: false,
  error: null,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        tasks: action.tasks,
        summary: action.summary,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SET_SEARCH":
      return { ...state, search: action.search };
    case "OPTIMISTIC_TOGGLE": {
      const tasks = state.tasks.map((t) =>
        t.id === action.id
          ? { ...t, status: t.status === "active" ? "completed" : "active" }
          : t
      );
      return { ...state, tasks };
    }
    case "OPTIMISTIC_REORDER":
      return { ...state, tasks: action.tasks };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Debounce ref for search
  const searchTimer = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(
    async (overrides = {}) => {
      dispatch({ type: "FETCH_START" });
      try {
        const params = {
          status: overrides.filter ?? state.filter,
          search: overrides.search ?? state.search,
        };
        const data = await api.getTasks(params);
        dispatch({ type: "FETCH_SUCCESS", tasks: data.tasks, summary: data.summary });
      } catch (err) {
        dispatch({ type: "FETCH_ERROR", error: err.message });
      }
    },
    [state.filter, state.search]
  );

  // Initial load
  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    fetchTasks({ filter: state.filter, search: state.search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filter]);

  // ── filter / search ────────────────────────────────────────────────────────

  const setFilter = useCallback((filter) => {
    dispatch({ type: "SET_FILTER", filter });
  }, []);

  const setSearch = useCallback(
    (search) => {
      dispatch({ type: "SET_SEARCH", search });
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        fetchTasks({ search, filter: state.filter });
      }, 300);
    },
    [fetchTasks, state.filter]
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (payload) => {
      await api.createTask(payload);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const updateTask = useCallback(
    async (id, payload) => {
      await api.updateTask(id, payload);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const deleteTask = useCallback(
    async (id) => {
      await api.deleteTask(id);
      await fetchTasks();
    },
    [fetchTasks]
  );

  const toggleTask = useCallback(
    async (id) => {
      // Optimistic update for snappiness
      dispatch({ type: "OPTIMISTIC_TOGGLE", id });
      try {
        await api.toggleTask(id);
        await fetchTasks();
      } catch {
        // rollback by re-fetching
        await fetchTasks();
      }
    },
    [fetchTasks]
  );

  const reorderTasks = useCallback(
    async (orderedTasks) => {
      dispatch({ type: "OPTIMISTIC_REORDER", tasks: orderedTasks });
      try {
        await api.reorderTasks(orderedTasks.map((t) => t.id));
      } catch {
        await fetchTasks();
      }
    },
    [fetchTasks]
  );

  const value = {
    ...state,
    fetchTasks,
    setFilter,
    setSearch,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
}
