import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assignedTo: {
      type: String, // References firebaseUID of the developer
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      type: String, // References firebaseUID of the creator (Admin/Client/Lead)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
