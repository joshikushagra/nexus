import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { createNotification } from "../services/notificationService.js";

/**
 * Creates or gets a chat room for a project.
 */
export const getOrCreateChatRoom = async (req, res) => {
  try {
    const { projectId } = req.body;

    let chatRoom = await ChatRoom.findOne({ projectId });

    if (!chatRoom) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      chatRoom = await ChatRoom.create({
        projectId,
        participants: project.teamMembers.concat(project.createdBy),
      });
    }

    res.status(200).json({ success: true, data: chatRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Sends a message in a chat room.
 */
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, text, attachments } = req.body;
    const senderUID = req.user.uid;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ success: false, message: "Chat room not found" });
    }

    const message = await Message.create({
      chatRoomId,
      senderUID,
      text,
      attachments,
    });

    // Update last message in chat room
    chatRoom.lastMessage = message._id;
    await chatRoom.save();

    // Notify other participants
    const otherParticipants = chatRoom.participants.filter(uid => uid !== senderUID);
    for (const recipientUID of otherParticipants) {
      await createNotification(req.app, {
        recipientUID,
        senderUID,
        type: "message_new",
        title: "New Message",
        message: `New message in project chat: ${text.substring(0, 30)}${text.length > 30 ? "..." : ""}`,
        link: `/projects/${chatRoom.projectId}`,
      });
    }

    // Emit socket event
    const io = req.app.get("io");
    io.to(chatRoomId.toString()).emit("new_message", message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gets message history for a chat room.
 */
export const getMessageHistory = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const messages = await Message.find({ chatRoomId }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
