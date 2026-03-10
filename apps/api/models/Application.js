import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId, // Can reference Project or ClientRequirement
      refPath: "projectModel",
      required: true,
      index: true,
    },
    projectModel: {
      type: String,
      required: true,
      enum: ["Project", "ClientRequirement"], // Polymorphic relation if applications span both
    },
    applicantUID: {
      type: String, // firebaseUID
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ projectId: 1, applicantUID: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
