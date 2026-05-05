# Notification & Logging System

A production-grade distributed notification and logging system built with the MERN stack and TypeScript.

---

## Project Structure

```
/
├── logging_middleware/          # Reusable logging package
├── notification_app_be/         # Express proxy backend (port 5000)
├── notification_app_fe/         # React dashboard frontend (port 3000)
└── notification_system_design.md
```

---

## Quick Start

### Step 1 — Register (one time only)

```bash
cd logging_middleware
cp .env.example .env
# Fill in ROLL_NUMBER and EMAIL in .env
npm install
npm run register
# Copy the printed LOG_CLIENT_ID and LOG_CLIENT_SECRET into both:
#   logging_middleware/.env
#   notification_app_be/.env
```

### Step 2 — Start the Backend

```bash
cd notification_app_be
cp .env.example .env
# Paste LOG_CLIENT_ID and LOG_CLIENT_SECRET from Step 1
npm install
npm run dev
# Runs on http://localhost:5000
```

### Step 3 — Start the Frontend

```bash
cd notification_app_fe
npm install
npm start
# Runs on http://localhost:3000
```

---

## API Reference (Backend Proxy)

| Method | Endpoint | Query Params |
|---|---|---|
| GET | `/api/notifications` | `limit`, `page`, `notification_type` |
| GET | `/health` | — |

Example:
```
GET http://localhost:5000/api/notifications?limit=20&page=1&notification_type=Placement
```

---

## Logging Integration

Every major entry point calls `Log(stack, level, package, message)`:

- Backend: server startup, every HTTP request (middleware), DB connections, controller actions
- Frontend: page mount, hook data fetches, component errors (ErrorBoundary), API interceptors

---

## Environment Variables

### `notification_app_be/.env`
```
PORT=5000
LOG_CLIENT_ID=
LOG_CLIENT_SECRET=
LOG_API_BASE=http://20.207.122.201/evaluation-service
NOTIFICATIONS_API_BASE=http://20.207.122.201/evaluation-service
```

### `notification_app_fe/.env`
```
PORT=3000
REACT_APP_API_BASE=http://localhost:5000
REACT_APP_LOG_CLIENT_ID=
REACT_APP_LOG_CLIENT_SECRET=
```
