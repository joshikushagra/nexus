import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },
    senderUID: {
      type: String, // firebaseUID
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String], // Array of file URLs
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [String], // Array of firebaseUIDs
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
