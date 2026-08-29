import api from "./api.js";

export async function getMyProfile() {
  const response = await api.get("/employers/me");
  return response.data;
}

export async function updateEmployerProfile(employerId, payload) {
  const response = await api.put(`/employers/${employerId}`, payload);
  return response.data;
}

export async function getEmployerJobs(employerId) {
  const response = await api.get(`/employers/${employerId}/jobs`);
  return response.data;
}

export async function createJob(employerId, payload) {
  const response = await api.post(`/employers/${employerId}/jobs`, payload);
  return response.data;
}

export async function updateJob(employerId, jobId, payload) {
  const response = await api.put(`/employers/${employerId}/jobs/${jobId}`, payload);
  return response.data;
}

export async function deleteJob(employerId, jobId) {
  const response = await api.delete(`/employers/${employerId}/jobs/${jobId}`);
  return response;
}

export async function getAllCandidates(employerId) {
  const response = await api.get(`/employers/${employerId}/candidates`);
  return response.data;
}

export async function searchCandidates(employerId, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ""),
  ).toString();
  const response = await api.get(
    `/employers/${employerId}/candidates/search${query ? `?${query}` : ""}`,
  );
  return response.data;
}

export async function getCandidateDetails(employerId, workerId) {
  const response = await api.get(`/employers/${employerId}/candidates/${workerId}/details`);
  return response.data;
}

export async function shortlistCandidate(employerId, workerId, jobId) {
  const response = await api.post(`/employers/${employerId}/candidates/${workerId}/shortlist`, {
    jobId,
  });
  return response.data;
}

export async function getPipeline(employerId, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ""),
  ).toString();
  const response = await api.get(`/employers/${employerId}/pipeline${query ? `?${query}` : ""}`);
  return response.data;
}

export async function updatePipelineStatus(employerId, appId, payload) {
  const response = await api.put(`/employers/${employerId}/pipeline/${appId}/status`, payload);
  return response.data;
}

export async function getEmployerAnalytics(employerId) {
  const response = await api.get(`/employers/${employerId}/analytics`);
  return response.data;
}
