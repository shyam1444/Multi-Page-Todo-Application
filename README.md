# TaskFlow | Multi-Page Todo Application

TaskFlow is a robust, full-stack multi-page todo application built to organize, prioritize, and manage tasks efficiently. It features a modern, glassmorphic dark-theme design.

The system is split into two primary components:
1. **Frontend**: A React application utilizing Vite configured for a true **Multi-Page Application (MPA)** architecture (using actual browser-level page navigation via `index.html` and `todo.html` rather than client-side SPA routing).
2. **Backend**: A Node.js & Express REST API server with a local JSON file-based database for persistence.

---

## System Architecture

```mermaid
graph TD
    subgraph Frontend (React / Vite MPA)
        A[index.html / Dashboard] -->|User clicks item link| B[todo.html?id=ID / Detail View]
        B -->|Back Navigation| A
    end
    subgraph Backend (Node.js & Express.js)
        C[Express Router] --> D[CRUD Handlers]
        D -->|Read / Write| E[(data/todos.json File DB)]
    end
    A -->|GET /api/todos| C
    A -->|POST /api/todos| C
    A -->|PUT /api/todos/:id| C
    B -->|GET /api/todos/:id| C
    B -->|PUT /api/todos/:id| C
    B -->|DELETE /api/todos/:id| C
```

---

## Features & Functionalities

### 1. Dashboard (`index.html`)
The main hub of the application allows users to view and manage tasks comprehensively.
*   **Live Statistics Dashboard**: Displays summary count cards:
    *   **Total Tasks**: Total count of all tasks.
    *   **Completed**: Count of checked tasks.
    *   **Pending**: Tasks that are not yet done.
    *   **High Priority**: Urgent pending tasks.
*   **Advanced Task Creation**: Support for:
    *   **Title** (Required validation)
    *   **Description**
    *   **Priority Levels**: Low, Medium, and High (color-coded badges).
    *   **Due Date**: Interactive date selector.
    *   **Category**: Text input (e.g. Work, Personal, Fitness).
    *   **Tags**: Dynamic tokenized inputs (comma/enter-separated tags) shown with a `#` badge.
*   **Filters & Search Panel**:
    *   **Search**: Real-time keyword filter across titles and descriptions.
    *   **Status Filter**: Show All, Active, or Completed tasks.
    *   **Priority Filter**: Show Low, Medium, or High priority items.
    *   **Dynamic Category Filter**: Automatically parses all categories present in the database to populate a custom drop-down list.
*   **Sort Actions**:
    *   **Newest First / Oldest First** (by creation timestamp).
    *   **Due Date** (soonest/latest).
    *   **Priority Weight** (High -> Medium -> Low).
*   **Interactive Task Cards**:
    *   Inline toggle checkboxes to check/uncheck tasks.
    *   Hyperlinked title and action buttons prompting true multi-page navigation to the details screen.

### 2. Task Details (`todo.html?id=<id>`)
A dedicated, standalone page displaying complete metadata associated with a single task.
*   **URL Query Processing**: Reads the `id` query parameter directly from the URL to fetch details from the database.
*   **Information Display**: Presents title, description, category, due date, status, creation timestamp, and last-updated timestamp.
*   **In-Place Editing**: Toggles an edit form directly on the page, letting the user modify any attribute (title, description, priority, category, due date, tags) and commit changes.
*   **Action Utilities**:
    *   *Toggle Completion*: Check off or reactivate a task.
    *   *Delete*: Deletes the task from the database and returns the browser to the main dashboard.
    *   *Back Navigation*: Browser-level navigation link back to the Dashboard (`index.html`).

---

## API Reference (Express Backend)

All endpoints accept and return JSON payloads.

### 1. Get All Todos
*   **URL**: `/api/todos`
*   **Method**: `GET`
*   **Query Parameters** (Optional):
    *   `search` (string): Text query to search in Title/Description.
    *   `status` (`all` | `active` | `completed`)
    *   `priority` (`all` | `low` | `medium` | `high`)
    *   `category` (string: e.g. `Work`, `Personal`)
    *   `sortBy` (`createdAt` | `dueDate` | `priority`)
    *   `sortOrder` (`asc` | `desc`)
*   **Response**: `200 OK` with array of todo objects.

### 2. Get Single Todo
*   **URL**: `/api/todos/:id`
*   **Method**: `GET`
*   **Response**: `200 OK` (object) or `404 Not Found` (JSON error).

### 3. Create Todo
*   **URL**: `/api/todos`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Payload**:
    ```json
    {
      "title": "Build a React App",
      "description": "Must be multi-page",
      "priority": "high",
      "dueDate": "2026-06-30",
      "category": "Work",
      "tags": ["react", "vite"]
    }
    ```
*   **Response**: `201 Created` with the newly generated todo object (including UUID `id` and timestamps).

### 4. Update Todo
*   **URL**: `/api/todos/:id`
*   **Method**: `PUT`
*   **Headers**: `Content-Type: application/json`
*   **Payload**: Partial body containing fields to update (e.g., `completed`, `title`, etc.).
*   **Response**: `200 OK` with the updated todo object.

### 5. Delete Todo
*   **URL**: `/api/todos/:id`
*   **Method**: `DELETE`
*   **Response**: `200 OK` with confirmation message and the deleted ID.

---

## Setup & Running the Application

Ensure you have **Node.js** (v18+) and **npm** installed.

### Step 1: Run the Backend
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```
   *(Uses nodemon for hot-reloading)*

### Step 2: Run the Frontend
1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the dashboard by opening `http://localhost:5173/` in your browser. (To access details manually, you can visit `http://localhost:5173/todo.html?id=<id>`).

---

## Local Persistence Setup
The application stores its databases in `backend/data/todos.json`. This file is created and seeded automatically with default tasks when the backend starts for the first time.
To reset or inspect the database, you can view or delete the `backend/data/todos.json` file.
