import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    projectType: {
      type: String,
      enum: ["portfolio", "startup", "collaboration"],
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String, // References firebaseUID of the creator
      required: true,
      index: true,
    },
    teamMembers: {
      type: [String], // Array of firebaseUIDs
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    githubRepoUrl: {
      type: String,
      default: "",  // Link to a specific GitHub repo for this project
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,   // Developer-updated completion percentage
    },
    progressNotes: {
      type: String,
      default: "",  // Developer's latest status update
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ projectType: 1, status: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
