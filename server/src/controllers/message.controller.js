import { getConversation, getInbox, markConversationRead, sendMessage } from "../services/message.service.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, message: error.message });

// POST /api/messages
export const createMessage = async (req, res) => {
  try {
    const message = await sendMessage(req.body, req.user.id);
    return res.status(201).json({ success: true, message: "Message sent successfully.", data: message });
  } catch (error) { return sendError(res, error); }
};

// GET /api/messages
export const getMyInbox = async (req, res) => {
  try {
    const inbox = await getInbox(req.user.id);
    return res.status(200).json({ success: true, data: inbox });
  } catch (error) { return sendError(res, error); }
};

// GET /api/messages/with/:userId
export const getConversationWith = async (req, res) => {
  try {
    const { limit } = req.query;
    const messages = await getConversation(req.user.id, req.params.userId, { limit });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) { return sendError(res, error); }
};

// PUT /api/messages/with/:userId/read
export const markRead = async (req, res) => {
  try {
    await markConversationRead(req.user.id, req.params.userId);
    return res.status(200).json({ success: true, message: "Conversation marked as read." });
  } catch (error) { return sendError(res, error); }
};
