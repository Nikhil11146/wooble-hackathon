import api from "./api.js";

export async function getConversations() {
  const response = await api.get("/messages/conversations");
  return response.data;
}

export async function getMessages(conversationId) {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
}

export async function startConversation(payload) {
  const response = await api.post("/messages", payload);
  return response.data;
}
