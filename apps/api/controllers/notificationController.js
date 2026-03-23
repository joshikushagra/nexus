import Notification from "../models/Notification.js";

/**
 * Gets all notifications for the logged-in user.
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientUID: req.user.uid }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Marks a notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientUID: req.user.uid },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Marks all notifications for a user as read.
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientUID: req.user.uid, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
