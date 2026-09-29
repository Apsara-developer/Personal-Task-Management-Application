const express = require("express");
const jwt = require("jsonwebtoken");

const Task = require("../models/Task");

const router = express.Router();

// ==========================
// AUTHENTICATION
// ==========================

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// ==========================
// GET TASKS
// ==========================

router.get("/", authenticate, async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      sort,
    } = req.query;

    const filter = {
      userId: req.userId,
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "dueDate") {
      sortOption = {
        dueDate: 1,
      };
    }

    if (sort === "priority") {
      sortOption = {
        priority: -1,
      };
    }

    const tasks = await Task.find(filter).sort(
      sortOption
    );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});

// ==========================
// CREATE TASK
// ==========================

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),

      description:
        description?.trim() || "",

      category:
        category || "Personal",

      status:
        status || "Pending",

      priority:
        priority || "Medium",

      dueDate:
        dueDate || null,

      userId: req.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// ==========================
// UPDATE TASK
// ==========================

router.put("/:id", authenticate, async (req, res) => {
  try {
    const task =
      await Task.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// ==========================
// DELETE TASK
// ==========================

router.delete(
  "/:id",
  authenticate,
  async (req, res) => {
    try {
      const task =
        await Task.findOneAndDelete({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      res.json({
        message:
          "Task deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete task",
        error: error.message,
      });
    }
  }
);

// ==========================
// STATISTICS
// ==========================

router.get(
  "/stats/summary",
  authenticate,
  async (req, res) => {
    try {
      const tasks = await Task.find({
        userId: req.userId,
      });

      const total = tasks.length;

      const completed = tasks.filter(
        (task) =>
          task.status === "Completed"
      ).length;

      const pending = tasks.filter(
        (task) =>
          task.status === "Pending"
      ).length;

      const inProgress = tasks.filter(
        (task) =>
          task.status === "In Progress"
      ).length;

      const highPriority = tasks.filter(
        (task) =>
          task.priority === "High"
      ).length;

      const now = new Date();

      const overdue = tasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) < now &&
          task.status !== "Completed"
      ).length;

      const completionPercentage =
        total === 0
          ? 0
          : Math.round(
              (completed / total) * 100
            );

      res.json({
        total,
        completed,
        pending,
        inProgress,
        highPriority,
        overdue,
        completionPercentage,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to load statistics",
        error: error.message,
      });
    }
  }
);

module.exports = router;