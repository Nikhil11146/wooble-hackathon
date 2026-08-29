import bcrypt from "bcryptjs";

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates password strength. Returns an array of error messages
 * (empty when the password is strong enough).
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (typeof password === "string") {
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number.");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("Password must contain at least one special character.");
  }
  return errors;
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
