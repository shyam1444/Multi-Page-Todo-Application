import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api/todos";

export default function DashboardApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [tagInput, setTagInput] = useState("");
  const [newTags, setNewTags] = useState([]);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch todos with current filters
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError("Unable to connect to server. Please ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filter parameters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTodos();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder]);

  // Handle Add Todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          priority: newPriority,
          dueDate: newDueDate,
          category: newCategory,
          tags: newTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      // Reset form
      setNewTitle("");
      setNewDesc("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewCategory("General");
      setNewTags([]);
      setTagInput("");

      // Refresh list
      fetchTodos();
    } catch (err) {
      alert("Error adding todo: " + err.message);
    }
  };

  // Handle Complete Toggle
  const handleToggleComplete = async (id, currentCompletedStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompletedStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchTodos();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  // Handle Delete Todo
  const handleDeleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      fetchTodos();
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  // Tag Input Handlers
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewTags(newTags.filter((t) => t !== tagToRemove));
  };

  // Stats Calculation
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = todos.filter((t) => t.priority === "high" && !t.completed).length;

  // Extract unique categories from list for filtering
  const allCategories = ["all", ...new Set(todos.map((t) => t.category).filter(Boolean))];

  return (
    <div className="app-container">
      <header>
        <h1>
          <span>⚡</span> TaskFlow
        </h1>
        <p>Your ultimate multi-page productivity partner</p>
      </header>

      {/* Stats Dashboard */}
      <section className="stats-grid">
        <div className="stat-card total">
          <span className="stat-title">Total Tasks</span>
          <span className="stat-value">{totalCount}</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-title">Completed</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-title">Pending</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card high-priority">
          <span className="stat-title">High Priority</span>
          <span className="stat-value">{highPriorityCount}</span>
        </div>
      </section>

      {/* Main Area */}
      <div className="dashboard-layout">
        {/* Left Panel: Creation Form */}
        <aside className="panel">
          <h2>Create New Task</h2>
          <form onSubmit={handleAddTodo}>
            <div className="form-group">
              <label htmlFor="todo-title">Task Title *</label>
              <input
                id="todo-title"
                type="text"
                required
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="todo-desc">Description</label>
              <textarea
                id="todo-desc"
                placeholder="Add more details about this task..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="todo-priority">Priority</label>
              <select
                id="todo-priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="todo-duedate">Due Date</label>
              <input
                id="todo-duedate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="todo-category">Category</label>
              <input
                id="todo-category"
                type="text"
                placeholder="e.g., Work, Personal, Health"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input-container">
                {newTags.map((tag) => (
                  <span key={tag} className="tag-badge">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type tag & press enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTag(e);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: "0.5rem", alignSelf: "flex-start" }}
                onClick={handleAddTag}
              >
                + Add Tag
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Add Task
            </button>
          </form>
        </aside>

        {/* Right Panel: Todos List & Filters */}
        <main>
          {/* Controls / Filter Bar */}
          <section className="panel" style={{ marginBottom: "1.5rem" }}>
            <div className="controls-bar">
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="filters-wrapper">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by Status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  aria-label="Filter by Priority"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by Category"
                >
                  <option value="all">All Categories</option>
                  {allCategories
                    .filter((c) => c !== "all")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  aria-label="Sort by"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="dueDate-asc">Due Date (Soonest)</option>
                  <option value="dueDate-desc">Due Date (Latest)</option>
                  <option value="priority-desc">Priority (High-Low)</option>
                  <option value="priority-asc">Priority (Low-High)</option>
                </select>
              </div>
            </div>
          </section>

          {/* List Display */}
          {error && <div className="panel" style={{ color: "var(--color-danger)", textAlign: "center" }}>{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks found</h3>
              <p>Add a new task or adjust your search filters.</p>
            </div>
          ) : (
            <div className="todos-list">
              {todos.map((todo) => (
                <article key={todo.id} className={`todo-item ${todo.completed ? "completed-state" : ""}`}>
                  <div className="todo-item-top">
                    <label className="checkbox-custom">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    
                    <div className="todo-content">
                      {/* Navigates to details page with query parameters */}
                      <a href={`todo.html?id=${todo.id}`} className="todo-title">
                        {todo.title}
                      </a>
                      {todo.description && <p className="todo-desc">{todo.description}</p>}
                    </div>

                    <div className="todo-actions">
                      <a href={`todo.html?id=${todo.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </a>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="btn btn-danger btn-sm"
                        aria-label="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="todo-meta">
                    <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                    {todo.category && <span className="badge badge-category">{todo.category}</span>}
                    {todo.dueDate && (
                      <span className="badge-date">
                        📅 {todo.dueDate}
                      </span>
                    )}
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="tag-list" style={{ marginLeft: "auto" }}>
                        {todo.tags.map((tag) => (
                          <span key={tag} className="tag-item">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
