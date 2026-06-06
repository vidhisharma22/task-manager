/**
 * utils/api.js
 * Thin wrapper around fetch that points all requests at the backend.
 * Using Vite's proxy, we can use relative paths in dev and the full URL in prod.
 */

const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.error ||
      (data.errors && data.errors.map((e) => e.msg).join(", ")) ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  /** Fetch tasks. Params: { status, search } */
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },

  getTask: (id) => request(`/tasks/${id}`),

  createTask: (payload) =>
    request("/tasks", { method: "POST", body: payload }),

  updateTask: (id, payload) =>
    request(`/tasks/${id}`, { method: "PUT", body: payload }),

  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: "PATCH" }),

  reorderTasks: (orderedIds) =>
    request("/tasks/reorder", { method: "POST", body: { orderedIds } }),
};
