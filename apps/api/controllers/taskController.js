import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Creates a new task for a project.
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, deadline } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Role check: Only project owner or admin can create tasks (Simple check for now)
    // req.user.uid is the firebaseUID attached by authMiddleware
    if (project.createdBy !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to create tasks for this project" });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      priority,
      deadline,
      createdBy: req.user.uid,
    });

    // Notify assigned developer
    await createNotification(req.app, {
      recipientUID: assignedTo,
      senderUID: req.user.uid,
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${title}`,
      link: `/projects/${projectId}`,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gets all tasks for a specific project.
 */
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Updates task status, assignedTo, priority, etc.
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Role check: Admin, Creator, or Assigned Developer can update status
    // Others might be restricted depending on the field (e.g., only creator can reassign)
    const isCreator = task.createdBy === req.user.uid;
    const isAssigned = task.assignedTo === req.user.uid;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssigned && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this task" });
    }

    // If not creator/admin, only allow status update
    if (!isCreator && !isAdmin && Object.keys(updates).some(key => key !== "status")) {
      return res.status(403).json({ success: false, message: "Only assigned developer can update status" });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    // Notify if status changed
    if (updates.status && updatedTask.status !== task.status) {
      const recipientUID = req.user.uid === updatedTask.assignedTo ? updatedTask.createdBy : updatedTask.assignedTo;
      await createNotification(req.app, {
        recipientUID,
        senderUID: req.user.uid,
        type: "task_updated",
        title: "Task Status Updated",
        message: `Task "${updatedTask.title}" is now ${updatedTask.status}`,
        link: `/projects/${updatedTask.projectId}`,
      });
    }

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Deletes a task.
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.createdBy !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this task" });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
