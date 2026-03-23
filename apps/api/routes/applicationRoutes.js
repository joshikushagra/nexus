import express from "express";
import { updateApplicationStatus, getApplications } from "../controllers/applicationController.js";
import { verifyToken, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get applications (Self or Project-specific)
router.get("/", verifyToken, getApplications);

// Update status (Shortlist, Accept, Reject)
// Restricted: Restricted to Founder, Client, or Admin
router.patch("/:id/status", verifyToken, restrictTo("founder", "client", "admin"), updateApplicationStatus);

export default router;
