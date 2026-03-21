import Organization from "../models/Organization.js";

// @desc   Create / link an organization (admin only)
// @route  POST /api/organizations
export const createOrganization = async (req, res, next) => {
  try {
    const { name, githubOrgName, description } = req.body;
    const org = await Organization.create({
      name,
      githubOrgName: githubOrgName.toLowerCase().trim(),
      description,
      adminFirebaseUID: req.user.uid,
    });
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all organizations
// @route  GET /api/organizations
export const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orgs.length, data: orgs });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single organization by ID
// @route  GET /api/organizations/:id
export const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc   Add a developer (by firebaseUID) to an org
// @route  PATCH /api/organizations/:id/members
export const addMember = async (req, res, next) => {
  try {
    const { firebaseUID } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { memberFirebaseUIDs: firebaseUID } },
      { new: true }
    );
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

// @desc   Add a client (by firebaseUID) to view an org
// @route  PATCH /api/organizations/:id/clients
export const addClient = async (req, res, next) => {
  try {
    const { firebaseUID } = req.body;
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { clientFirebaseUIDs: firebaseUID } },
      { new: true }
    );
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};
