import { z } from "zod";

const INDIAN_PHONE_PATTERN = /^(?:\+91)?[6-9]\d{9}$/;

const isValidPhone = (value) => {
  if (!value) return true;
  const digits = String(value).replace(/[\s-]/g, "");
  return INDIAN_PHONE_PATTERN.test(digits);
};

export const registerSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["WORKER", "EMPLOYER", "ADMIN"], { message: "Invalid user role." }),
  name: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(isValidPhone, { message: "Enter a valid phone number." }),
});