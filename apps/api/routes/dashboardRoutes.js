import express from "express";
import { getDashboardInsights } from "../controllers/dashboardController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/insights", verifyToken, getDashboardInsights);

export default router;
