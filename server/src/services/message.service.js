import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import EmployerProfile from "../models/EmployerProfile.js";
import Job from "../models/Job.js";
import { createNotification } from "./notification.service.js";

const serviceError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const profileNameFor = async (user) => {
  if (user.role === "WORKER") {
    const profile = await WorkerProfile.findOne({ userId: user._id });
    return profile?.name || user.email;
  }
  if (user.role === "EMPLOYER") {
    const profile = await EmployerProfile.findOne({ userId: user._id });
    return profile?.companyName || user.email;
  }
  return user.email;
};

export const getConversations = async (userId) => {
  const currentUserId = new mongoose.Types.ObjectId(userId);
  const grouped = await Message.aggregate([
    { $match: { $or: [{ senderId: currentUserId }, { recipientId: currentUserId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ["$senderId", currentUserId] }, "$recipientId", "$senderId"] },
        jobId: { $first: "$jobId" },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ["$recipientId", currentUserId] }, { $eq: ["$read", false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  if (!grouped.length) return [];

  const otherIds = grouped.map((group) => group._id);
  const users = await User.find({ _id: { $in: otherIds } });
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  const conversations = await Promise.all(
    grouped.map(async (group) => {
      const other = userMap.get(String(group._id));
      if (!other) return null;

      const lastMessage = group.lastMessage;
      const job = lastMessage.jobId ? await Job.findById(lastMessage.jobId) : null;

      return {
        id: other._id,
        otherUser: {
          id: other._id,
          role: other.role,
          email: other.email,
          name: await profileNameFor(other),
        },
        job: job ? { id: job._id, title: job.title } : null,
        lastMessage: {
          id: lastMessage._id,
          senderId: lastMessage.senderId,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          read: String(lastMessage.senderId) === String(userId) ? true : Boolean(lastMessage.read),
        },
        unreadCount: group.unreadCount || 0,
        lastActivity: lastMessage.createdAt,
      };
    }),
  );

  return conversations
    .filter(Boolean)
    .sort((left, right) => new Date(right.lastActivity) - new Date(left.lastActivity));
};

export const getMessages = async (userId, otherUserId) => {
  if (!otherUserId) throw serviceError("Conversation partner is required.", 400);
  if (!mongoose.isValidObjectId(otherUserId)) throw serviceError("Invalid conversation partner.", 400);
  return Message.find({
    $or: [
      { senderId: userId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: userId },
    ],
  }).sort({ createdAt: 1 });
};

export const sendMessage = async (userId, { recipientId, jobId, content }) => {
  if (!recipientId || !content?.trim()) throw serviceError("Recipient and message content are required.", 400);
  if (String(recipientId) === String(userId)) throw serviceError("You cannot message yourself.", 400);

  const recipient = await User.findById(recipientId);
  if (!recipient) throw serviceError("Recipient does not exist.", 404);

  const message = await Message.create({
    senderId: userId,
    recipientId,
    jobId: jobId || undefined,
    content: content.trim(),
  });

  try {
    await createNotification({
      userId: recipientId,
      type: "MESSAGE",
      resourceId: message._id,
      title: "New message",
      message: content.trim().slice(0, 120),
    });
  } catch {
    // Notification delivery is best-effort and must not fail message send.
  }

  return message;
};

export const markThreadRead = (userId, otherUserId) =>
  Message.updateMany({ senderId: otherUserId, recipientId: userId, read: false }, { read: true, readAt: new Date() });

export const searchRecipients = async (userId, query) => {
  const term = String(query || "").trim().toLowerCase();
  const current = await User.findById(userId);
  if (!current) throw serviceError("User not found.", 404);

  const oppositeRole = current.role === "WORKER" ? "EMPLOYER" : "WORKER";
  const profiles = oppositeRole === "WORKER" ? await WorkerProfile.find() : await EmployerProfile.find();
  const nameByUserId = new Map(
    profiles.map((profile) => [
      String(profile.userId),
      (oppositeRole === "WORKER" ? profile.name : profile.companyName) || null,
    ]),
  );

  const users = await User.find({ _id: { $in: [...nameByUserId.keys()] }, role: oppositeRole });

  return users
    .map((user) => {
      const name = nameByUserId.get(String(user._id));
      return {
        id: user._id,
        name: name || user.email,
        email: user.email,
        role: user.role,
      };
    })
    .filter(
      (recipient) =>
        !term ||
        recipient.name.toLowerCase().includes(term) ||
        recipient.email.toLowerCase().includes(term),
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 25);
};