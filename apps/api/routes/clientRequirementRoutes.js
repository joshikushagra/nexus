import express from "express";
import { 
  createClientRequirement, 
  getClientRequirements, 
  applyToRequirement 
} from "../controllers/clientRequirementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getClientRequirements)
  .post(verifyToken, createClientRequirement);

router.post("/:id/apply", verifyToken, applyToRequirement);

export default router;
