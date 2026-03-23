import express from "express";
import { createProject, getProjects, getProjectById, updateProjectProgress } from "../controllers/projectController.js";
import { verifyToken, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getProjects)
  .post(verifyToken, restrictTo("founder", "client_owner", "admin"), createProject);

router.route("/:id")
  .get(getProjectById);

router.patch("/:id/progress", verifyToken, updateProjectProgress);

export default router;
