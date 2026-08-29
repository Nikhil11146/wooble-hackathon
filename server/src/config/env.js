import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const FALLBACK_JWT_SECRET = "kaushalsetu_super_secret_jwt_key_2026";
const FALLBACK_REFRESH_SECRET = "kaushalsetu_super_refresh_jwt_key_2026";

/**
 * In production we refuse to silently fall back to generator-known secrets.
 * Deployments must ship real JWT secrets or the process fails fast.
 */
const requireSecret = (value, fallback, name) => {
  if (value && value !== fallback) return value;
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}. Refusing to start with a fallback secret in production.`);
  }
  return value || fallback;
};

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/kaushalsetu",
  JWT_SECRET: requireSecret(process.env.JWT_SECRET, FALLBACK_JWT_SECRET, "JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REFRESH_TOKEN_SECRET: requireSecret(process.env.REFRESH_TOKEN_SECRET, FALLBACK_REFRESH_SECRET, "REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
