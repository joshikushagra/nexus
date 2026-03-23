import Joi from "joi";

/**
 * Validation schemas for Nexus resources.
 */

export const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(5).required(),
  projectId: Joi.string().hex().length(24).required(),
  assignedTo: Joi.string().required(),
  status: Joi.string().valid("todo", "in-progress", "review", "completed"),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
  deadline: Joi.date().iso(),
});

export const projectSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().required(),
  projectType: Joi.string().valid("portfolio", "startup", "collaboration").required(),
  teamMembers: Joi.array().items(Joi.string()),
});

export const applicationStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "shortlisted", "accepted", "rejected").required(),
});

export const requirementSchema = Joi.object({
  title: Joi.string().min(5).max(150).required(),
  description: Joi.string().required(),
  budget: Joi.number().positive().required(),
  timeline: Joi.string().required(),
  skillsRequired: Joi.array().items(Joi.string()).min(1).required(),
});
