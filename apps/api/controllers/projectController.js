import Project from "../models/Project.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Valid Firebase Token Required)
export const createProject = async (req, res, next) => {
  try {
    const { title, description, techStack, projectType, images, teamMembers } = req.body;
    
    // req.user.uid comes from the auth middleware
    const project = await Project.create({
      title,
      description,
      techStack,
      projectType,
      images,
      createdBy: req.user.uid,
      teamMembers: teamMembers || [],
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active projects (with basic filtering)
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.projectType) {
      query.projectType = req.query.projectType;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};
