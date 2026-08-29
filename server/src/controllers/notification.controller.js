import Notification from "../models/Notification.js";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notification.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

// GET /api/notifications
export const listNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const notifications = await getNotifications(req.user.id, { unreadOnly: unreadOnly === "true", limit });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) { return sendError(res, error); }
};

// GET /api/notifications/:id
export const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) { return sendError(res, error); }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    const notification = await markNotificationRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    return res.status(200).json({ success: true, message: "Notification marked as read.", data: notification });
  } catch (error) { return sendError(res, error); }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.id);
    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) { return sendError(res, error); }
};
