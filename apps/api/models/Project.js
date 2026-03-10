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
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ projectType: 1, status: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
