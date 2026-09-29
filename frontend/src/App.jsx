import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";

const categories = [
  "Work",
  "College",
  "Personal",
  "Interview",
  "Project",
  "Other",
];

function App() {
  const [page, setPage] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(
      localStorage.getItem("user")
    ) || null
  );

  const [tasks, setTasks] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    overdue: 0,
    completionPercentage: 0,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Personal");

  const [priority, setPriority] =
    useState("Medium");

  const [status, setStatus] =
    useState("Pending");

  const [dueDate, setDueDate] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("All");

  const [filterPriority, setFilterPriority] =
    useState("All");

  const [filterCategory, setFilterCategory] =
    useState("All");

  const [sort, setSort] =
    useState("newest");

  // ==========================
  // LOAD DATA
  // ==========================

  useEffect(() => {
    if (token) {
      loadTasks();
      loadStats();
    }
  }, [
    token,
    search,
    filterStatus,
    filterPriority,
    filterCategory,
    sort,
  ]);

  // ==========================
  // SIGNUP
  // ==========================

  const signup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/api/auth/signup`,
        {
          name,
          email,
          password,
        }
      );

      alert(
        "Account created successfully!"
      );

      setName("");
      setEmail("");
      setPassword("");

      setPage("login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Signup failed"
      );
    }
  };

  // ==========================
  // LOGIN
  // ==========================

  const login = async (e) => {
    e.preventDefault();

    try {
      const response =
        await axios.post(
          `${API_URL}/api/auth/login`,
          {
            email,
            password,
          }
        );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      );

      setToken(response.data.token);
      setUser(response.data.user);

      setEmail("");
      setPassword("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  // ==========================
  // LOAD TASKS
  // ==========================

  const loadTasks = async () => {
    try {
      const response =
        await axios.get(
          `${API_URL}/api/tasks`,
          {
            params: {
              search,
              status: filterStatus,
              priority: filterPriority,
              category: filterCategory,
              sort,
            },

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // LOAD STATS
  // ==========================

  const loadStats = async () => {
    try {
      const response =
        await axios.get(
          `${API_URL}/api/tasks/stats/summary`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // SAVE TASK
  // ==========================

  const saveTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(
        "Please enter a task title."
      );
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description,
        category,
        priority,
        status,
        dueDate:
          dueDate || null,
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/api/tasks/${editingId}`,
          taskData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Task updated successfully!"
        );
      } else {
        await axios.post(
          `${API_URL}/api/tasks`,
          taskData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Task created successfully!"
        );
      }

      clearForm();

      loadTasks();
      loadStats();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save task"
      );
    }
  };

  // ==========================
  // EDIT TASK
  // ==========================

  const editTask = (task) => {
    setEditingId(task._id);

    setTitle(task.title);

    setDescription(
      task.description || ""
    );

    setCategory(
      task.category || "Personal"
    );

    setPriority(task.priority);

    setStatus(task.status);

    setDueDate(
      task.dueDate
        ? task.dueDate.substring(0, 10)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================
  // DELETE TASK
  // ==========================

  const deleteTask = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/tasks/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      loadTasks();
      loadStats();
    } catch (error) {
      alert(
        "Failed to delete task"
      );
    }
  };

  // ==========================
  // CLEAR FORM
  // ==========================

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("Personal");
    setPriority("Medium");
    setStatus("Pending");
    setDueDate("");
  };

  // ==========================
  // LOGOUT
  // ==========================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setToken(null);
    setUser(null);
    setTasks([]);

    setPage("login");

    clearForm();
  };

  // ==========================
  // AUTH SCREEN
  // ==========================

  if (!token) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="logo">
            ✓
          </div>

          <h1>
            TaskFlow
          </h1>

          <p className="subtitle">
            Manage your tasks.
            Achieve your goals.
          </p>

          {page === "login" ? (
            <>
              <h2>
                Welcome back
              </h2>

              <form
                onSubmit={login}
              >

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Login
                </button>

              </form>

              <p className="switch-text">
                Don't have an account?

                <button
                  className="link-button"
                  onClick={() =>
                    setPage(
                      "signup"
                    )
                  }
                >
                  Create account
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>
                Create your account
              </h2>

              <form
                onSubmit={signup}
              >

                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  minLength="6"
                  required
                />

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Create Account
                </button>

              </form>

              <p className="switch-text">
                Already have an account?

                <button
                  className="link-button"
                  onClick={() =>
                    setPage(
                      "login"
                    )
                  }
                >
                  Login
                </button>
              </p>
            </>
          )}

        </div>

      </div>
    );
  }

  // ==========================
  // DASHBOARD
  // ==========================

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            ✓
          </div>

          <span>
            TaskFlow
          </span>
        </div>

        <nav>

          <button className="nav-active">
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            📝 My Tasks
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.name}
              </strong>

              <small>
                {user?.email}
              </small>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        <div className="topbar">

          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Here's your task overview
            </p>
          </div>

          <button
            className="add-task-top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            + New Task
          </button>

        </div>

        {/* STATISTICS */}

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              📋
            </div>

            <div>
              <span>
                Total Tasks
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              ⏳
            </div>

            <div>
              <span>
                In Progress
              </span>

              <strong>
                {stats.inProgress}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              ⚠
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {stats.overdue}
              </strong>
            </div>
          </div>

        </div>

        {/* PROGRESS */}

        <div className="progress-card">

          <div>
            <h3>
              Overall Progress
            </h3>

            <p>
              {stats.completed} of{" "}
              {stats.total} tasks
              completed
            </p>
          </div>

          <strong>
            {stats.completionPercentage}%
          </strong>

          <div className="progress-bar">

            <div
              style={{
                width:
                  `${stats.completionPercentage}%`,
              }}
            />

          </div>

        </div>

        {/* CREATE TASK */}

        <section className="task-form-card">

          <div className="section-title">

            <div>
              <h2>
                {editingId
                  ? "Edit Task"
                  : "Create New Task"}
              </h2>

              <p>
                Add details about your task
              </p>
            </div>

          </div>

          <form
            onSubmit={saveTask}
          >

            <div className="form-grid">

              <div className="form-group full">

                <label>
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Complete project documentation"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-group full">

                <label>
                  Description
                </label>

                <textarea
                  placeholder="Add some details..."
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="form-group">

                <label>
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value
                    )
                  }
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                </select>

              </div>

              <div className="form-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="form-actions">

              <button
                className="primary-btn"
                type="submit"
              >
                {editingId
                  ? "Update Task"
                  : "Create Task"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    clearForm
                  }
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* TASKS */}

        <section className="task-section">

          <div className="task-section-header">

            <div>
              <h2>
                My Tasks
              </h2>

              <p>
                Manage and organize
                your tasks
              </p>
            </div>

            <span className="task-count">
              {tasks.length} shown
            </span>

          </div>

          {/* FILTERS */}

          <div className="filters">

            <input
              className="search"
              type="text"
              placeholder="🔎 Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Priority
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="dueDate">
                Due Date
              </option>

              <option value="priority">
                Priority
              </option>
            </select>

          </div>

          {/* TASK LIST */}

          {tasks.length === 0 ? (
            <div className="empty-state">

              <div>
                📝
              </div>

              <h3>
                No tasks found
              </h3>

              <p>
                Create a task or
                change your filters.
              </p>

            </div>
          ) : (
            <div className="task-grid">

              {tasks.map(
                (task) => {

                  const overdue =
                    task.dueDate &&
                    new Date(
                      task.dueDate
                    ) < new Date() &&
                    task.status !==
                      "Completed";

                  return (
                    <div
                      className="task-card"
                      key={
                        task._id
                      }
                    >

                      <div className="task-card-top">

                        <span
                          className={`category ${task.category.toLowerCase()}`}
                        >
                          {task.category}
                        </span>

                        <span
                          className={`priority-badge ${task.priority.toLowerCase()}`}
                        >
                          {task.priority}
                        </span>

                      </div>

                      <h3>
                        {task.title}
                      </h3>

                      <p className="description">
                        {task.description ||
                          "No description provided"}
                      </p>

                      <div className="task-meta">

                        <span>
                          {task.status ===
                          "Completed"
                            ? "✓"
                            : task.status ===
                              "In Progress"
                            ? "◐"
                            : "○"}{" "}
                          {task.status}
                        </span>

                        {task.dueDate && (
                          <span
                            className={
                              overdue
                                ? "overdue"
                                : ""
                            }
                          >
                            📅{" "}
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>

                      <div className="task-card-actions">

                        <button
                          onClick={() =>
                            editTask(
                              task
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteTask(
                              task._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;