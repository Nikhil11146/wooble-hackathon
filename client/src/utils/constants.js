export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const STORAGE_KEYS = {
  TOKEN: "kaushal_token",
  REFRESH_TOKEN: "kaushal_refresh_token",
  USER: "kaushal_user",
  PROFILE: "kaushal_profile",
};

export const ROLES = {
  WORKER: "WORKER",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
};

export const APPLICATION_STATUS = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export const JOB_STATUS = {
  OPEN: "Open",
  CLOSED: "Closed",
  FILLED: "Filled",
};

export const EMPLOYMENT_TYPES = {
  FULL_TIME: "Full time",
  CONTRACT: "Contract",
  TEMPORARY: "Temporary",
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: "Available immediately",
  PART_TIME: "Part time only",
  UNAVAILABLE: "Not available",
};

export const VERIFICATION_STATUS = {
  SELF_DECLARED: "Self declared",
  DOCUMENT: "Document verified",
  EMPLOYER: "Employer verified",
  ASSESSMENT: "Assessment passed",
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const VERIFICATION_COLOURS = {
  SELF_DECLARED: "bg-indigo-100 text-indigo-800",
  DOCUMENT: "bg-blue-100 text-blue-800",
  EMPLOYER: "bg-emerald-100 text-emerald-800",
  ASSESSMENT: "bg-violet-100 text-violet-800",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export const TRUST_SCORE_FACTORS = [
  { key: "verifiedSkills", label: "Verified skills", max: 25 },
  { key: "experience", label: "Experience", max: 18 },
  { key: "employerRatings", label: "Employer ratings", max: 20 },
  { key: "completedJobs", label: "Completed jobs", max: 14 },
  { key: "certifications", label: "Certifications", max: 10 },
  { key: "assessmentPass", label: "Assessment pass", max: 8 },
  { key: "profileCompleteness", label: "Profile completeness", max: 5 },
];

export const SIDEBAR_LINKS = {
  WORKER: [
    ["Dashboard", "/worker"],
    ["Profile", "/worker/profile"],
    ["Skills", "/worker/skills"],
    ["Jobs", "/worker/jobs"],
    ["Applications", "/worker/applications"],
    ["Messages", "/worker/messages"],
  ],
  EMPLOYER: [
    ["Dashboard", "/employer"],
    ["Post a job", "/employer/jobs/new"],
    ["Candidates", "/employer/candidates"],
    ["Pipeline", "/employer/pipeline"],
    ["Analytics", "/employer/analytics"],
  ],
  ADMIN: [
    ["Dashboard", "/admin"],
    ["Verifications", "/admin/verifications"],
    ["Platform stats", "/admin/stats"],
  ],
};
