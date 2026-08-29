import api from "./api.js";

export async function getAllUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function updateUserStatus(userId, verified) {
  const response = await api.put(`/admin/users/${userId}/status`, { verified });
  return response.data;
}

export async function getAllWorkers() {
  const response = await api.get("/admin/workers");
  return response.data;
}

export async function getAllEmployers() {
  const response = await api.get("/admin/employers");
  return response.data;
}

export async function getAllJobs() {
  const response = await api.get("/admin/jobs");
  return response.data;
}

export async function getPlatformAnalytics() {
  const response = await api.get("/admin/analytics");
  return response.data;
}

export async function getPlatformStats() {
  const response = await api.get("/admin/platform-stats");
  return response.data;
}

export async function getPendingVerifications() {
  const response = await api.get("/admin/verifications");
  return response.data;
}

export async function approveVerification(verificationId, notes) {
  const response = await api.put(`/admin/verifications/${verificationId}/approve`, { notes });
  return response.data;
}

export async function rejectVerification(verificationId, notes) {
  const response = await api.put(`/admin/verifications/${verificationId}/reject`, { notes });
  return response.data;
}
