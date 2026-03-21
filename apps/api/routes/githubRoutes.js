import express from "express";
import { getOrgInfo, getOrgRepos, getOrgMembers } from "../controllers/githubController.js";

const router = express.Router();

router.get("/org/:orgName", getOrgInfo);
router.get("/org/:orgName/repos", getOrgRepos);
router.get("/org/:orgName/members", getOrgMembers);

export default router;
