import {
  getConversations as findConversations,
  getMessages as findMessages,
  markThreadRead as updateThreadRead,
  searchRecipients as findRecipients,
  sendMessage as createMessage,
} from "../services/message.service.js";
import { emitToUser } from "../sockets/socket.server.js";

const sendServiceError = (res, error) =>
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error." });

// GET /api/messages/conversations
export const listConversations = async (req, res) => {
  try {
    const data = await findConversations(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// GET /api/messages/recipients?q=
export const listRecipients = async (req, res) => {
  try {
    const data = await findRecipients(req.user.id, req.query.q);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// GET /api/messages/:otherUserId
export const listMessages = async (req, res) => {
  try {
    const data = await findMessages(req.user.id, req.params.otherUserId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// POST /api/messages
export const send = async (req, res) => {
  try {
    const data = await createMessage(req.user.id, req.body);

    // Push the new message to both sides of the conversation in real time.
    const payload = data.toObject();
    emitToUser(req.user.id, "message:new", payload);
    emitToUser(data.recipientId, "message:new", payload);

    return res.status(201).json({ success: true, message: "Message sent.", data });
  } catch (error) {
    return sendServiceError(res, error);
  }
};

// POST /api/messages/:otherUserId/read
export const markRead = async (req, res) => {
  try {
    await updateThreadRead(req.user.id, req.params.otherUserId);

    // Let the sender know their messages were seen.
    emitToUser(req.params.otherUserId, "message:read", {
      threadId: req.user.id,
      by: req.user.id,
    });

    return res.status(200).json({ success: true, data: null });
  } catch (error) {
    return sendServiceError(res, error);
  }
};