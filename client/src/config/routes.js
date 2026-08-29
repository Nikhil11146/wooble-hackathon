export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WORKER: "/worker",
  WORKER_ONBOARDING: "/worker/onboarding",
  WORKER_PROFILE: "/worker/profile",
  WORKER_SKILLS: "/worker/skills",
  WORKER_JOBS: "/worker/jobs",
  WORKER_APPLICATIONS: "/worker/applications",
  WORKER_MESSAGES: "/worker/messages",
  EMPLOYER: "/employer",
  EMPLOYER_JOBS: "/employer/jobs/new",
  EMPLOYER_CANDIDATES: "/employer/candidates",
  EMPLOYER_PIPELINE: "/employer/pipeline",
  EMPLOYER_ANALYTICS: "/employer/analytics",
  ADMIN: "/admin",
  ADMIN_VERIFICATIONS: "/admin/verifications",
  ADMIN_STATS: "/admin/stats",
};

export function dashboardPath(role) {
  if (role === "EMPLOYER") return PATHS.EMPLOYER;
  if (role === "ADMIN") return PATHS.ADMIN;
  return PATHS.WORKER;
}
