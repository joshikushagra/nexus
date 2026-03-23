import express from "express";
import { getOrCreateChatRoom, sendMessage, getMessageHistory } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/room", verifyToken, getOrCreateChatRoom);
router.post("/send", verifyToken, sendMessage);
router.get("/history/:chatRoomId", verifyToken, getMessageHistory);

export default router;
