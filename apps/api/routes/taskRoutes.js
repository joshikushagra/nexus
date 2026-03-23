import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/taskController.js";
import { verifyToken, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get tasks for a specific project
router.get("/project/:projectId", verifyToken, getTasks);

// Create a task — Restricted to Admin/Founders (Clients can be added later)
router.post("/", verifyToken, restrictTo("founder", "client", "admin"), createTask);

// Update a task (status, assigned user, etc.)
router.patch("/:id", verifyToken, updateTask);

// Delete a task
router.delete("/:id", verifyToken, restrictTo("founder", "admin"), deleteTask);

export default router;
