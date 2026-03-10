import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderUID: {
      type: String, // firebaseUID
      required: true,
      index: true,
    },
    receiverUID: {
      type: String, // firebaseUID
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Useful for querying chronological history
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
