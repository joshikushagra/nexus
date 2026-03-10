import ClientRequirement from "../models/ClientRequirement.js";
import Application from "../models/Application.js";

// @desc    Create a new client requirement
// @route   POST /api/client-requirements
// @access  Private
export const createClientRequirement = async (req, res, next) => {
  try {
    const { title, description, budget, timeline, skillsRequired } = req.body;
    
    const requirement = await ClientRequirement.create({
      title,
      description,
      budget,
      timeline,
      skillsRequired,
      postedBy: req.user.uid,
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get open client requirements
// @route   GET /api/client-requirements
// @access  Public
export const getClientRequirements = async (req, res, next) => {
  try {
    const requirements = await ClientRequirement.find({ status: "open" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to a client requirement
// @route   POST /api/client-requirements/:id/apply
// @access  Private
export const applyToRequirement = async (req, res, next) => {
  try {
    const requirementId = req.params.id;
    const { message } = req.body;
    const applicantUID = req.user.uid;

    const requirement = await ClientRequirement.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, message: "Requirement not found" });
    }

    // Check if user already applied
    const existingApp = await Application.findOne({
      projectId: requirementId,
      applicantUID,
    });

    if (existingApp) {
      return res.status(400).json({ success: false, message: "You have already applied" });
    }

    // Create Application
    const application = await Application.create({
      projectId: requirementId,
      projectModel: "ClientRequirement",
      applicantUID,
      message,
    });

    // Add applicant reference to the requirement
    await ClientRequirement.findByIdAndUpdate(requirementId, {
      $addToSet: { applicants: applicantUID }
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
