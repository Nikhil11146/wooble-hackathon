import api from "./api.js";

export async function getMyProfile() {
  const response = await api.get("/workers/me");
  return response.data;
}

export async function getWorkerProfile(workerId) {
  const response = await api.get(`/workers/${workerId}/profile`);
  return response.data;
}

export async function updateWorkerProfile(workerId, payload) {
  const response = await api.put(`/workers/${workerId}/profile`, payload);
  return response.data;
}

export async function getWorkerSkills(workerId) {
  const response = await api.get(`/workers/${workerId}/skills`);
  return response.data;
}

export async function addWorkerSkill(workerId, payload) {
  const response = await api.post(`/workers/${workerId}/skills`, payload);
  return response.data;
}

export async function updateWorkerSkill(workerId, skillId, payload) {
  const response = await api.put(`/workers/${workerId}/skills/${skillId}`, payload);
  return response.data;
}

export async function removeWorkerSkill(workerId, skillId) {
  const response = await api.delete(`/workers/${workerId}/skills/${skillId}`);
  return response.data;
}

export async function getWorkerCertifications(workerId) {
  const response = await api.get(`/workers/${workerId}/certifications`);
  return response.data;
}

export async function addWorkerCertification(workerId, payload) {
  const response = await api.post(`/workers/${workerId}/certifications`, payload);
  return response.data;
}

export async function getWorkerWorkHistory(workerId) {
  const response = await api.get(`/workers/${workerId}/work-history`);
  return response.data;
}

export async function addWorkerWorkHistory(workerId, payload) {
  const response = await api.post(`/workers/${workerId}/work-history`, payload);
  return response.data;
}

export async function getTrustScore(workerId) {
  const response = await api.get(`/workers/${workerId}/trust-score`);
  return response.data;
}

export async function getWorkerApplications(workerId) {
  const response = await api.get(`/workers/${workerId}/applications`);
  return response.data;
}

export async function getRecommendedJobs() {
  const response = await api.get("/jobs/recommended");
  return response.data;
}

export async function searchJobs(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ""),
  ).toString();
  const response = await api.get(`/jobs/search${query ? `?${query}` : ""}`);
  return response.data;
}

export async function getJobById(jobId) {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
}

export async function applyToJob(jobId) {
  const response = await api.post("/applications", { jobId });
  return response.data;
}

export async function requestVerification(payload) {
  const response = await api.post("/verifications/request", payload);
  return response.data;
}

export async function getWorkerVerifications(workerId) {
  const response = await api.get(`/verifications/${workerId}`);
  return response.data;
}
