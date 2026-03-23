import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import ClientRequirement from "../models/ClientRequirement.js";

/**
 * Gets dashboard insights for any role.
 * Role-based filtering is applied within the controller.
 */
export const getDashboardInsights = async (req, res) => {
  try {
    const { uid, role } = req.user;
    let insights = {};

    if (role === "admin" || role === "founder") {
      // Admin Insights
      const [totalProjects, activeProjects, totalUsers, openTasks, completedTasks] = await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: "active" }),
        User.countDocuments(),
        Task.countDocuments({ status: { $ne: "completed" } }),
        Task.countDocuments({ status: "completed" }),
      ]);

      insights = {
        totalProjects,
        activeProjects,
        totalUsers,
        openTasks,
        completedTasks,
        projectHealth: await calculateProjectHealth(),
      };
    } else if (role === "client" || role === "client_owner") {
      // Client Insights
      const [myProjects, myRequirements, unreadNotifications] = await Promise.all([
        Project.find({ createdBy: uid }),
        ClientRequirement.find({ postedBy: uid }),
        Notification.countDocuments({ recipientUID: uid, isRead: false }),
      ]);

      insights = {
        projectsCount: myProjects.length,
        requirementsCount: myRequirements.length,
        unreadNotifications,
        activeProjects: myProjects.filter(p => p.status === "active"),
      };
    } else if (role === "developer") {
      // Developer Insights
      const [myTasks, myProjects, unreadNotifications] = await Promise.all([
        Task.find({ assignedTo: uid, status: { $ne: "completed" } }),
        Project.find({ teamMembers: uid }),
        Notification.countDocuments({ recipientUID: uid, isRead: false }),
      ]);

      insights = {
        pendingTasksCount: myTasks.length,
        unreadNotifications,
        myTasks,
        projectsCount: myProjects.length,
      };
    }

    // Recent Activity (shared for all roles)
    insights.recentActivity = await Notification.find({ recipientUID: uid })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to calculate macro project health.
 */
async function calculateProjectHealth() {
  const projects = await Project.find({ status: "active" });
  if (projects.length === 0) return { onTrack: 0, delayed: 0 };

  // Mock logic: randomly assign health for demo
  // In production, compare current date vs task deadlines
  return {
    onTrack: Math.ceil(projects.length * 0.8),
    delayed: Math.floor(projects.length * 0.2),
  };
}
