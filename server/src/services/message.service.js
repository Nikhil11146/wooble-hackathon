import Message from "../models/Message.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

export const sendMessage = ({ recipientId, jobId, content }, senderId) => {
  if (!recipientId || !content) throw serviceError("recipientId and content are required.", 400);
  return Message.create({ senderId, recipientId, jobId, content });
};

export const getConversation = (userId, otherUserId, { limit = 50 } = {}) =>
  Message.find({
    $or: [
      { senderId: userId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 100));

export const getInbox = (userId) =>
  Message.aggregate([
    { $match: { $or: [{ senderId: userId }, { recipientId: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$senderId", userId] }, "$recipientId", "$senderId"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$recipientId", userId] }, { $eq: ["$read", false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

export const markConversationRead = (userId, otherUserId) =>
  Message.updateMany(
    { senderId: otherUserId, recipientId: userId, read: false },
    { read: true, readAt: new Date() },
  );
