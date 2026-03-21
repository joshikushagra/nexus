import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load Routes (we will create these next)
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import clientRequirementRoutes from "./routes/clientRequirementRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";

// Mount Routers
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/client-requirements", clientRequirementRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/organizations", organizationRoutes);

// Healthcheck
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
