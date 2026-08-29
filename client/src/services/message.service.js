import api from "./api.js";

export async function getConversations() {
  const response = await api.get("/messages/conversations");
  return response.data;
}

export async function getMessages(otherUserId) {
  const response = await api.get(`/messages/${otherUserId}`);
  return response.data;
}

export async function sendMessage(payload) {
  const response = await api.post("/messages", payload);
  return response.data;
}

export async function markThreadRead(otherUserId) {
  const response = await api.post(`/messages/${otherUserId}/read`);
  return response.data;
}