# TaskFlow — Personal Task Manager

> Studio Graphene Full Stack Developer Assessment — Exercise 1

A clean, full-stack personal task manager built with **Node.js + Express** on the backend and **React + Vite** on the frontend. All tasks persist to a **SQLite** database so nothing is lost on server restart.

---

## Live Demo

> Deploy links go here once hosted (see [Deployment](#deployment) section below).

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

> **Windows users**: The root `npm run dev` uses `&` to run both servers in parallel, which works in Git Bash / WSL. In cmd.exe, open two terminals and run `npm run dev:server` and `npm run dev:client` separately.

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

---

### `POST /api/tasks`

Create a new task.

**Request body**
```json
{
  "title": "Buy milk",          // required
  "description": "Semi-skimmed", // optional
  "due_date": "2025-06-10"       // optional, ISO 8601 date
}
```

**Response 201** — the created task object.

**Response 422** — validation errors array.

---

### `GET /api/tasks/:id`

Fetch a single task.

**Response 200** — task object. **Response 404** if not found.

---

### `PUT /api/tasks/:id`

Replace a task's editable fields.

**Request body**
```json
{
  "title": "Updated title",
  "description": "New desc",
  "due_date": "2025-07-01",
  "status": "active"
}
```

**Response 200** — updated task object.

---

### `PATCH /api/tasks/:id/toggle`

Toggle status between `active` and `completed`.

**Response 200** — updated task object.

---

### `DELETE /api/tasks/:id`

Delete a task permanently.

**Response 200**
```json
{ "message": "Task deleted", "id": "uuid" }
```

---

### `POST /api/tasks/reorder`

Persist a new display order after a drag-and-drop interaction.

**Request body**
```json
{ "orderedIds": ["uuid-1", "uuid-2", "uuid-3"] }
```

**Response 200**
```json
{ "message": "Order updated" }
```

---

### `GET /health`

Health check — returns `{ "status": "ok" }`.

---

## Project Structure

```
task-manager/
├── package.json            ← root scripts (install:all, dev, test)
│
├── server/
│   ├── index.js            ← Express app entry point
│   ├── database.js         ← SQLite setup & singleton
│   ├── package.json
│   ├── .env.example
│   ├── data/               ← tasks.db created here at runtime (git-ignored)
│   ├── middleware/
│   │   └── errorHandler.js ← centralised error handling
│   └── routes/
│       ├── tasks.js        ← all task REST endpoints
│       └── tasks.test.js   ← Jest + Supertest integration tests
│
└── client/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx          ← root component, wires panels + dialogs
        ├── index.css        ← all styles (design tokens → component styles)
        ├── context/
        │   └── TaskContext.jsx  ← global state via useReducer + Context
        ├── hooks/
        │   └── useConfirm.js   ← async confirm-dialog hook
        ├── utils/
        │   ├── api.js          ← thin fetch wrapper for all API calls
        │   └── date.js         ← date formatting helpers
        └── components/
            ├── Header.jsx      ← brand, summary pills, search, filter tabs
            ├── TaskList.jsx    ← DnD wrapper + sortable list
            ├── TaskCard.jsx    ← individual task row
            ├── TaskForm.jsx    ← create / edit slide-in panel
            ├── EmptyState.jsx  ← friendly empty state
            └── ConfirmDialog.jsx ← delete confirmation modal
```

---

## Deployment

### Frontend — Vercel / Netlify

1. Push the repo to GitHub.
2. Connect the `client/` folder to Vercel or Netlify.
3. Set the build command to `npm run build` and publish directory to `dist`.
4. Set the environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

### Backend — Render

1. Create a new **Web Service** pointing at the `server/` folder.
2. Build command: `npm install`
3. Start command: `node index.js`
4. Set env var: `CLIENT_ORIGIN=https://your-frontend.vercel.app`

> **Note**: Render's free tier spins down after inactivity, so the first request may take ~30 s.

---

## Next Steps

Given more time I would:

- **Authentication**: Add a simple JWT-based login so multiple users can each have their own tasks, rather than assuming one user.
- **Due-date reminders**: Browser Notifications API or email (via Nodemailer) to alert when a task is past due.
- **Recurring tasks**: A `recurrence` field (daily / weekly / monthly) with automatic next-occurrence creation on completion.
- **Priority levels**: A `priority` enum (low / medium / high) with visual indicators and sorting options.
- **Subtasks**: Nested checklist items within a task.
- **Tags/labels**: Free-form labels for cross-cutting concerns.
- **More test coverage**: Currently the tests cover the key API paths. I would add React Testing Library tests for the components (especially TaskForm validation and the toggle interaction).
- **Accessibility audit**: Run axe or Lighthouse and fix any remaining a11y issues.
- **Optimistic updates for all mutations**: Currently only toggle and reorder are optimistic; create/update/delete could be too.
