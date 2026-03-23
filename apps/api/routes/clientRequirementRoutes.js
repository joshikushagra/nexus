import express from "express";
import { 
  createClientRequirement, 
  getClientRequirements, 
  applyToRequirement 
} from "../controllers/clientRequirementController.js";
import { verifyToken, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getClientRequirements)
  .post(verifyToken, restrictTo("founder", "client_owner", "admin"), createClientRequirement);

router.post("/:id/apply", verifyToken, applyToRequirement);

export default router;
