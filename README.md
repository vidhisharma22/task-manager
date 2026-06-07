# TaskFlow — Personal Task Manager

> Studio Graphene Full Stack Developer Assessment — Exercise 1

A clean, full-stack personal task manager built with **Node.js + Express** on the backend and **React + Vite** on the frontend. All tasks persist to a **SQLite** database so nothing is lost on server restart.

---

## Live Demo

- 🌐 **Frontend**: https://task-manager-swart-ten.vercel.app
- 🔧 **Backend API**: https://task-manager-api-ini2.onrender.com

> **Note**: Backend is hosted on Render's free tier. First request may take 30–60 seconds to wake up.
---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend runtime | Node.js 18+ | Specified by the brief |
| Backend framework | Express 4 | Lightweight, widely understood, great ecosystem |
| Database | SQLite (better-sqlite3) | Zero-config persistence; single file; synchronous API keeps route code simple |
| Validation | express-validator | Declarative, pairs cleanly with Express middleware |
| Frontend bundler | Vite | Fast HMR; much lighter than CRA; excellent DX |
| Frontend framework | React 18 | Specified by the brief |
| State management | React Context + useReducer | Sufficient for a single-user app; no extra dependency overhead |
| Drag-and-drop | @dnd-kit | Accessible, pointer + keyboard support out of the box |
| Styling | Plain CSS with custom properties | Full control; no build-time dependency; easy to read |
| Testing | Jest + Supertest | Integration tests against the live Express app |

---

## Features

### Must-have (all implemented)
- ✅ Add a task with title (required), description and due date (optional)
- ✅ View all tasks sorted newest-first by default
- ✅ Toggle complete / incomplete
- ✅ Edit title, description, due date
- ✅ Delete with confirmation prompt
- ✅ Filter by All / Active / Done

### Should-have (all implemented)
- ✅ Active vs completed count displayed as pills in the header
- ✅ Overdue tasks visually distinguished (amber left-border + label)
- ✅ Empty-state UI for all three filter states

### Bonus (all implemented)
- ✅ Search tasks by title (debounced 300 ms)
- ✅ Persist across restarts — SQLite database in `server/data/tasks.db`
- ✅ Drag-and-drop to reorder tasks (keyboard-accessible via @dnd-kit)  
---

## How to Run Locally

You only need **Node.js 18+** and **npm** installed.

```bash
# 1. Clone / extract the project
cd task-manager

# 2. Install all dependencies (server + client) in one command
npm run install:all

# 3. Copy environment files (defaults work out of the box)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Start both servers concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### Running tests

```bash
npm test
# or directly:
cd server && npm test
```
---

## API Documentation

Base URL: `http://localhost:4000`

All request and response bodies are JSON.

### `GET /api/tasks`

Returns all tasks and a summary count.

**Query params**

| Param | Type | Values | Default |
|-------|------|--------|---------|
| `status` | string | `all` \| `active` \| `completed` | `all` |
| `search` | string | partial title match | — |

**Response 200**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy milk",
      "description": null,
      "due_date": "2025-06-10",
      "status": "active",
      "position": 0,
      "created_at": "2025-06-05T14:30:00.000Z",
      "updated_at": "2025-06-05T14:30:00.000Z"
    }
  ],
  "summary": { "active": 3, "completed": 1, "total": 4 }
}
```

### `POST /api/tasks`
Create a new task.

**Request body**
```json
{
  "title": "Buy milk",
  "description": "Semi-skimmed",
  "due_date": "2025-06-10"
}
```
**Response 201** — the created task object.

### `PUT /api/tasks/:id`
Replace a task's editable fields.

**Response 200** — updated task object.

### `PATCH /api/tasks/:id/toggle`
Toggle status between `active` and `completed`.

### `DELETE /api/tasks/:id`
Delete a task permanently.

**Response 200**
```json
{ "message": "Task deleted", "id": "uuid" }
```

### `POST /api/tasks/reorder`
Persist a new display order after drag-and-drop.

**Response 200**
```json
{ "message": "Order updated" }
```

### `GET /health`
Health check — returns `{ "status": "ok" }`.
---

## Project Structure
---

## Next Steps

Given more time I would:

- **Authentication**: Add JWT-based login for multiple users.
- **Due-date reminders**: Browser Notifications or email alerts for overdue tasks.
- **Recurring tasks**: Auto next-occurrence creation on completion.
- **Priority levels**: Low/medium/high with visual indicators.
- **Subtasks**: Nested checklist items within a task.
- **Tags/labels**: Free-form labels for cross-cutting concerns.
- **More test coverage**: React Testing Library tests for components.
- **Accessibility audit**: Run axe or Lighthouse and fix a11y issues.
- **Optimistic updates**: For create/update/delete mutations.