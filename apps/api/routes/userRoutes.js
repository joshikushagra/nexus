import express from "express";
import { createUser, getCurrentUser, getAllUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Token-verifying basic route
router.post("/", verifyToken, createUser);

// Get all users
router.get("/", verifyToken, getAllUsers);

// Get my own profile based on decoded Firebase token
router.get("/me", verifyToken, getCurrentUser);

export default router;
