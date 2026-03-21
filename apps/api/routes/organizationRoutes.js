import express from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  addMember,
  addClient,
} from "../controllers/organizationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getOrganizations)
  .post(verifyToken, createOrganization);

router.route("/:id")
  .get(getOrganizationById);

router.patch("/:id/members", verifyToken, addMember);
router.patch("/:id/clients", verifyToken, addClient);

export default router;
