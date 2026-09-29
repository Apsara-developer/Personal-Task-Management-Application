import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [tasks, setTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // ==========================
  // SIGNUP
  // ==========================

  const signup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password,
      });

      alert("Signup successful!");

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
      const response = await axios.post(
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
        JSON.stringify(response.data.user)
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
      const response = await axios.get(
        `${API_URL}/api/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(response.data);
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
      alert("Enter task title");
      return;
    }

    try {
      const taskData = {
        title,
        description,
        priority,
        status,
        dueDate: dueDate || null,
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/api/tasks/${editingId}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/api/tasks`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      clearForm();
      loadTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save task"
      );
    }
  };

  // ==========================
  // DELETE TASK
  // ==========================

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadTasks();
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  // ==========================
  // EDIT TASK
  // ==========================

  const editTask = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);

    if (task.dueDate) {
      setDueDate(task.dueDate.substring(0, 10));
    } else {
      setDueDate("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================
  // CLEAR FORM
  // ==========================

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Pending");
    setDueDate("");
  };

  // ==========================
  // LOGOUT
  // ==========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setTasks([]);

    setPage("login");
  };

  // ==========================
  // LOGIN / SIGNUP PAGE
  // ==========================

  if (!token) {
    return (
      <div className="container">
        <div className="auth-card">

          <h1>Personal Task Management</h1>

          {page === "login" ? (
            <>
              <h2>Login</h2>

              <form onSubmit={login}>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button type="submit">
                  Login
                </button>

              </form>

              <p>
                Don't have an account?

                <button
                  className="link-button"
                  onClick={() =>
                    setPage("signup")
                  }
                >
                  Signup
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Signup</h2>

              <form onSubmit={signup}>

                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button type="submit">
                  Create Account
                </button>

              </form>

              <p>
                Already have an account?

                <button
                  className="link-button"
                  onClick={() =>
                    setPage("login")
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
    <div className="dashboard">

      <header>

        <div>
          <h1>Personal Task Management</h1>

          <p>
            Welcome, <strong>{user?.name}</strong>
          </p>
        </div>

        <button
          className="logout"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      <main>

        <section className="task-form">

          <h2>
            {editingId
              ? "Edit Task"
              : "Create New Task"}
          </h2>

          <form onSubmit={saveTask}>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <div className="row">

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
              >
                <option value="Low">
                  Low Priority
                </option>

                <option value="Medium">
                  Medium Priority
                </option>

                <option value="High">
                  High Priority
                </option>
              </select>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
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

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />

            </div>

            <button type="submit">
              {editingId
                ? "Update Task"
                : "Add Task"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}

          </form>

        </section>

        <section className="tasks">

          <div className="tasks-header">

            <h2>My Tasks</h2>

            <span>
              {tasks.length} task
              {tasks.length !== 1 ? "s" : ""}
            </span>

          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              No tasks available.
            </div>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (

                <div
                  className="task-card"
                  key={task._id}
                >

                  <div className="task-top">

                    <h3>{task.title}</h3>

                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                  </div>

                  <p>
                    {task.description ||
                      "No description"}
                  </p>

                  <div className="task-info">

                    <span>
                      Status: {task.status}
                    </span>

                    {task.dueDate && (
                      <span>
                        Due:{" "}
                        {new Date(
                          task.dueDate
                        ).toLocaleDateString()}
                      </span>
                    )}

                  </div>

                  <div className="task-actions">

                    <button
                      onClick={() =>
                        editTask(task)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() =>
                        deleteTask(task._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;