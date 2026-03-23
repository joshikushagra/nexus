import Application from "../models/Application.js";
import Project from "../models/Project.js";
import ClientRequirement from "../models/ClientRequirement.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Updates the status of an application.
 * If status is 'accepted', it automatically creates a new Project.
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Role check: Only the owner of the Requirement/Project can update application status
    let ownerId;
    if (application.projectModel === "ClientRequirement") {
      const requirement = await ClientRequirement.findById(application.projectId);
      ownerId = requirement.postedBy;
    } else {
      const project = await Project.findById(application.projectId);
      ownerId = project.createdBy;
    }

    if (ownerId !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to update this application" });
    }

    application.status = status;
    await application.save();

    // Notify applicant of status update (Rejected, Shortlisted, etc.)
    if (status !== "accepted") {
      await createNotification(req.app, {
        recipientUID: application.applicantUID,
        senderUID: req.user.uid,
        type: "application_status",
        title: "Application Updated",
        message: `Your application status is now ${status}.`,
        link: "/work",
      });
    }

    // If accepted, create a project (if it was a Requirement)
    if (status === "accepted" && application.projectModel === "ClientRequirement") {
      const requirement = await ClientRequirement.findById(application.projectId);
      
      const newProject = await Project.create({
        title: requirement.title,
        description: requirement.description,
        projectType: "startup", 
        createdBy: req.user.uid, 
        teamMembers: [application.applicantUID], 
        status: "active",
      });

      // Notify developer of acceptance and project creation
      await createNotification(req.app, {
        recipientUID: application.applicantUID,
        senderUID: req.user.uid,
        type: "project_created",
        title: "Application Accepted!",
        message: `Your application was accepted and a new project "${newProject.title}" has been created.`,
        link: `/projects/${newProject._id}`,
      });

      // Close the requirement
      requirement.status = "closed";
      await requirement.save();

      return res.status(200).json({ 
        success: true, 
        message: "Application accepted and Project created", 
        data: { application, project: newProject } 
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gets applications for a specific user (as applicant) or for a specific project.
 */
export const getApplications = async (req, res) => {
  try {
    const { projectId, applicantUID } = req.query;
    let query = {};

    if (projectId) query.projectId = projectId;
    if (applicantUID) query.applicantUID = applicantUID;

    // If no query params, show my own applications (as applicant)
    if (!projectId && !applicantUID) {
      query.applicantUID = req.user.uid;
    }

    const applications = await Application.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
