import User from "../models/User.js";

// @desc    Create a new user (sync from Firebase to MongoDB)
// @route   POST /api/users
// @access  Private (Valid Firebase Token Required)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, bio, skills, profilePicture, experienceLevel, location } = req.body;
    const firebaseUID = req.user.uid; // Attached by verifyToken middleware

    let user = await User.findOne({ firebaseUID });
    
    // Create new if it doesn't exist
    if (!user) {
      user = await User.create({
        firebaseUID,
        name,
        email,
        role,
        bio,
        skills,
        profilePicture,
        experienceLevel,
        location,
      });
      return res.status(201).json({ success: true, data: user });
    }

    return res.status(200).json({ success: true, message: "User already exists", data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in DB" });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for Admin Panel / Client Network)
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
