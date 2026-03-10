import mongoose from "mongoose";

const clientRequirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    postedBy: {
      type: String, // References user's firebaseUID
      required: true,
      index: true,
    },
    applicants: {
      type: [String], // Array of firebaseUIDs
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

clientRequirementSchema.index({ skillsRequired: 1, status: 1 });

const ClientRequirement = mongoose.model("ClientRequirement", clientRequirementSchema);

export default ClientRequirement;
