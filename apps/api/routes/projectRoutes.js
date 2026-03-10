import express from "express";
import { createProject, getProjects, getProjectById } from "../controllers/projectController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getProjects) // Public or Protected depending on requirement, assuming anyone can see projects
  .post(verifyToken, createProject);

router.route("/:id")
  .get(getProjectById);

export default router;
