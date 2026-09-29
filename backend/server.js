const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================
// MIDDLEWARE
// ==========================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// ==========================
// HOME ROUTE
// ==========================

app.get("/", (req, res) => {
  res.json({
    message: "Personal Task Management API is running",
  });
});

// ==========================
// API ROUTES
// ==========================

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

// ==========================
// MONGODB CONNECTION
// ==========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Backend running at http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed");
    console.error(error);
  });