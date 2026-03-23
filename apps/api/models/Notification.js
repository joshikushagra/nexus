import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientUID: {
      type: String, // firebaseUID
      required: true,
      index: true,
    },
    senderUID: {
      type: String, // firebaseUID
    },
    type: {
      type: String,
      enum: ["application_new", "application_status", "task_assigned", "task_updated", "message_new", "project_created"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // URL to redirect to (e.g., /projects/:id)
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
