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

// @desc    Developer updates project progress
// @route   PATCH /api/projects/:id/progress
// @access  Private (developer only)
export const updateProjectProgress = async (req, res, next) => {
  try {
    const { progress, progressNotes, githubRepoUrl } = req.body;
    const update = {};
    if (progress !== undefined) update.progress = Math.min(100, Math.max(0, Number(progress)));
    if (progressNotes !== undefined) update.progressNotes = progressNotes;
    if (githubRepoUrl !== undefined) update.githubRepoUrl = githubRepoUrl;

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};
