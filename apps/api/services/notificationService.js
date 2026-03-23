import Notification from "../models/Notification.js";

/**
 * Utility service to create and broadcast notifications.
 */
export const createNotification = async (app, data) => {
  try {
    const notification = await Notification.create({
      recipientUID: data.recipientUID,
      senderUID: data.senderUID,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    });

    // Broadcast via Socket.io if available
    const io = app.get("io");
    if (io) {
      io.to(data.recipientUID).emit("notification_new", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};
