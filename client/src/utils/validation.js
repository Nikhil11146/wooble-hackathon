const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:\+91)?[6-9]\d{9}$/;

export function isEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim());
}

export function isPassword(value) {
  return String(value || "").length >= 6;
}

export function isPhone(value) {
  if (!value) return true;
  const digits = String(value).trim().replace(/[\s-]/g, "");
  return PHONE_PATTERN.test(digits);
}

export function isRequired(value) {
  return String(value ?? "").trim().length > 0;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!isPassword(password)) errors.password = "Password must be at least 6 characters.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegister({ email, password, role, name, companyName, phone }) {
  const errors = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!isPassword(password)) errors.password = "Password must be at least 6 characters.";
  if (!role) errors.role = "Select an account type.";
  if (phone && !isPhone(phone)) errors.phone = "Enter a valid phone number.";
  if (role === "WORKER" && !isRequired(name)) errors.name = "Full name is required.";
  if (role === "EMPLOYER" && !isRequired(companyName)) errors.companyName = "Company name is required.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProfileForm(data, role = "WORKER") {
  const errors = {};
  if (role === "WORKER" && !isRequired(data.name)) errors.name = "Full name is required.";
  if (role === "EMPLOYER" && !isRequired(data.companyName)) errors.companyName = "Company name is required.";
  if (data.phone && !isPhone(data.phone)) errors.phone = "Enter a valid phone number.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateJobForm(data) {
  const errors = {};
  if (!isRequired(data.title)) errors.title = "Job title is required.";
  if (data.salary?.min && data.salary?.max && Number(data.salary.min) > Number(data.salary.max)) {
    errors.salaryMax = "Maximum salary must be greater than minimum salary.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSkillForm(data) {
  const errors = {};
  if (!isRequired(data.name)) errors.name = "Skill name is required.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function getFirstError(errors) {
  return Object.values(errors)[0] || null;
}
