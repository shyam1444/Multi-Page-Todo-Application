import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "todos.json");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed data
const initialTodos = [
  {
    id: "todo-1",
    title: "Complete Alfaleus Assignment",
    description: "Build a multi-page React application with Express backend and file storage.",
    completed: false,
    priority: "high",
    dueDate: "2026-06-30",
    category: "Work",
    tags: ["react", "node", "assignment"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "todo-2",
    title: "Grocery Shopping",
    description: "Buy milk, eggs, bread, and fruits for the week.",
    completed: true,
    priority: "low",
    dueDate: "2026-06-27",
    category: "Personal",
    tags: ["shopping", "groceries"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "todo-3",
    title: "Workout",
    description: "30 minutes of cardio and strength training.",
    completed: false,
    priority: "medium",
    dueDate: "2026-06-29",
    category: "Health",
    tags: ["fitness", "gym"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper: Ensure database exists and return todos
async function readTodos() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(DB_FILE, JSON.stringify(initialTodos, null, 2), "utf-8");
        return initialTodos;
      }
      throw err;
    }
  } catch (error) {
    console.error("Database read error:", error);
    return [];
  }
}

// Helper: Write to database
async function writeTodos(todos) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(todos, null, 2), "utf-8");
  } catch (error) {
    console.error("Database write error:", error);
    throw new Error("Failed to save data.");
  }
}

// API Routes

// 1. GET all todos (with filtering, sorting, and search)
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await readTodos();
    const { search, status, priority, category, sortBy, sortOrder } = req.query;
    
    let filteredTodos = [...todos];

    // Search filter (title & description)
    if (search) {
      const query = search.toLowerCase();
      filteredTodos = filteredTodos.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (status && status !== "all") {
      const isCompleted = status === "completed";
      filteredTodos = filteredTodos.filter((t) => t.completed === isCompleted);
    }

    // Priority filter
    if (priority && priority !== "all") {
      filteredTodos = filteredTodos.filter(
        (t) => t.priority.toLowerCase() === priority.toLowerCase()
      );
    }

    // Category filter
    if (category && category !== "all") {
      filteredTodos = filteredTodos.filter(
        (t) => t.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sorting
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      filteredTodos.sort((a, b) => {
        if (sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate) * order;
        }
        if (sortBy === "priority") {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const weightA = priorityWeight[a.priority] || 0;
          const weightB = priorityWeight[b.priority] || 0;
          return (weightA - weightB) * order;
        }
        // Default sort by createdAt or database order
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return (timeA - timeB) * order;
      });
    }

    res.json(filteredTodos);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET single todo by ID
app.get("/api/todos/:id", async (req, res) => {
  try {
    const todos = await readTodos();
    const todo = todos.find((t) => t.id === req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. POST - Create new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, tags } = req.body;
    
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required and must be a non-empty string" });
    }

    const todos = await readTodos();
    const newTodo = {
      id: uuidv4(),
      title: title.trim(),
      description: (description || "").trim(),
      completed: false,
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
      dueDate: dueDate || "",
      category: (category || "General").trim(),
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.push(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. PUT - Update a todo
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate, category, tags } = req.body;
    const todos = await readTodos();
    const todoIndex = todos.findIndex((t) => t.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const currentTodo = todos[todoIndex];
    
    // Perform updates if fields are provided
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Title must be a non-empty string" });
      }
      currentTodo.title = title.trim();
    }
    
    if (description !== undefined) {
      currentTodo.description = description.trim();
    }

    if (completed !== undefined) {
      currentTodo.completed = Boolean(completed);
    }

    if (priority !== undefined) {
      if (["low", "medium", "high"].includes(priority)) {
        currentTodo.priority = priority;
      } else {
        return res.status(400).json({ error: "Priority must be low, medium, or high" });
      }
    }

    if (dueDate !== undefined) {
      currentTodo.dueDate = dueDate;
    }

    if (category !== undefined) {
      currentTodo.category = category.trim() || "General";
    }

    if (tags !== undefined) {
      currentTodo.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(Boolean) : [];
    }

    currentTodo.updatedAt = new Date().toISOString();
    todos[todoIndex] = currentTodo;

    await writeTodos(todos);
    res.json(currentTodo);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. DELETE - Remove a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todos = await readTodos();
    const filteredTodos = todos.filter((t) => t.id !== req.params.id);

    if (filteredTodos.length === todos.length) {
      return res.status(404).json({ error: "Todo not found" });
    }

    await writeTodos(filteredTodos);
    res.json({ message: "Todo deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
