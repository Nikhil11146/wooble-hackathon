import Notification from "../models/Notification.js";

export const createNotification = (data) => Notification.create(data);

export const getNotifications = (userId, { unreadOnly = false, limit = 50 } = {}) =>
  Notification.find({ userId, ...(unreadOnly && { read: false }) }).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 50, 100));

export const markNotificationRead = async (notificationId, userId) =>
  Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true, readAt: new Date() }, { new: true });

export const markAllNotificationsRead = (userId) =>
  Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
