import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api/todos";

export default function TodoDetailApp() {
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Retrieve the ID from URL query parameters (e.g., todo.html?id=xxx)
  const getTodoId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  };

  const todoId = getTodoId();

  const fetchTodoDetails = async () => {
    if (!todoId) {
      setError("No valid task ID was specified in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/${todoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Task not found. It might have been deleted.");
        }
        throw new Error("Failed to fetch task details.");
      }
      const data = await response.json();
      setTodo(data);
      
      // Initialize edit fields
      setEditTitle(data.title || "");
      setEditDesc(data.description || "");
      setEditPriority(data.priority || "medium");
      setEditDueDate(data.dueDate || "");
      setEditCategory(data.category || "General");
      setEditTags(data.tags || []);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodoDetails();
  }, [todoId]);

  // Handle Complete Status Toggle
  const handleToggleComplete = async () => {
    if (!todo) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle completion status.");
      }

      fetchTodoDetails();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      alert("Title is required.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          priority: editPriority,
          dueDate: editDueDate,
          category: editCategory,
          tags: editTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes.");
      }

      setIsEditing(false);
      fetchTodoDetails();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  // Handle Delete Todo
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${todoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }

      // Redirect back to main dashboard
      window.location.href = "index.html";
    } catch (err) {
      alert("Error deleting task: " + err.message);
    }
  };

  // Tags Handlers inside editing
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <span>⚡</span> TaskFlow Detail View
        </h1>
        <a href="index.html" className="btn btn-secondary">
          ← Back to Dashboard
        </a>
      </header>

      {loading ? (
        <div className="spinner"></div>
      ) : error ? (
        <section className="panel" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <h2 style={{ color: "var(--color-danger)" }}>Error</h2>
          <p style={{ marginBottom: "1.5rem" }}>{error}</p>
          <a href="index.html" className="btn btn-primary">
            Back to Dashboard
          </a>
        </section>
      ) : !todo ? (
        <section className="panel" style={{ textAlign: "center" }}>
          <h2>Task Not Found</h2>
          <a href="index.html" className="btn btn-primary">
            Back to Dashboard
          </a>
        </section>
      ) : (
        <section className="panel detail-card">
          {!isEditing ? (
            /* Display View */
            <>
              <div className="detail-header">
                <div className="detail-title-section">
                  <span className={`badge badge-${todo.priority}`} style={{ marginBottom: "0.5rem" }}>
                    {todo.priority} Priority
                  </span>
                  <h2 className="detail-title">{todo.title}</h2>
                </div>
                <div className="detail-actions-top">
                  <button
                    onClick={handleToggleComplete}
                    className={`btn ${todo.completed ? "btn-secondary" : "btn-success"}`}
                  >
                    {todo.completed ? "Mark Incomplete" : "✓ Mark Completed"}
                  </button>
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                    Edit
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </div>

              <div className="detail-body">
                {todo.description ? todo.description : <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No description provided.</span>}
              </div>

              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-info-label">Status</span>
                  <span className="detail-info-value" style={{ color: todo.completed ? "var(--color-success)" : "var(--color-warning)" }}>
                    {todo.completed ? "✓ Completed" : "⚡ Pending"}
                  </span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Category</span>
                  <span className="detail-info-value">{todo.category || "General"}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Due Date</span>
                  <span className="detail-info-value">{todo.dueDate ? `📅 ${todo.dueDate}` : "No due date"}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Tags</span>
                  <div className="tag-list">
                    {todo.tags && todo.tags.length > 0 ? (
                      todo.tags.map((tag) => (
                        <span key={tag} className="tag-item">#{tag}</span>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="detail-footer">
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Created: {new Date(todo.createdAt).toLocaleString()}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Last Updated: {new Date(todo.updatedAt).toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            /* Editing View */
            <form onSubmit={handleEditSubmit} className="edit-form">
              <h2>Edit Task</h2>

              <div className="form-group">
                <label htmlFor="edit-title">Title *</label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-duedate">Due Date</label>
                <input
                  id="edit-duedate"
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <input
                  id="edit-category"
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input-container">
                  {editTags.map((tag) => (
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

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Revert edit forms back to todo data
                    setEditTitle(todo.title || "");
                    setEditDesc(todo.description || "");
                    setEditPriority(todo.priority || "medium");
                    setEditDueDate(todo.dueDate || "");
                    setEditCategory(todo.category || "General");
                    setEditTags(todo.tags || []);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
