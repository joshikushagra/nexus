import express from "express";
import { getOrgInfo, getOrgRepos, getOrgMembers } from "../controllers/githubController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/org/:orgName", verifyToken, getOrgInfo);
router.get("/org/:orgName/repos", verifyToken, getOrgRepos);
router.get("/org/:orgName/members", verifyToken, getOrgMembers);

export default router;
