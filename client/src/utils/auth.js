import { STORAGE_KEYS } from "./constants.js";

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ token, refreshToken, user, profile }) {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  if (profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function updateStoredProfile(profile) {
  if (profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

export function isAuthenticated() {
  return Boolean(getToken() && getStoredUser());
}

export function hasRole(role) {
  return getStoredUser()?.role === role;
}

export function getProfileId() {
  const profile = getStoredProfile();
  return profile?._id || profile?.id || null;
}

export function getDashboardPath(role = getStoredUser()?.role) {
  if (role === "EMPLOYER") return "/employer";
  if (role === "ADMIN") return "/admin";
  return "/worker";
}
