import express from "express";
import { createUser, getCurrentUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Token-verifying basic route
router.post("/", verifyToken, createUser);

// Get my own profile based on decoded Firebase token
router.get("/me", verifyToken, getCurrentUser);

export default router;
