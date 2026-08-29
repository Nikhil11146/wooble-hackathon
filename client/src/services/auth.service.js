import api from "./api.js";
import { clearSession, setSession } from "../utils/auth.js";

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  const { token, refreshToken, user, profile } = response.data;
  setSession({ token, refreshToken, user, profile });
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  const { token, refreshToken, user, profile } = response.data;
  setSession({ token, refreshToken, user, profile });
  return response.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearSession();
  }
}

export async function refresh(refreshToken) {
  const response = await api.post("/auth/refresh", { refreshToken });
  setSession({
    token: response.data.token,
    refreshToken: response.data.refreshToken,
  });
  return response.data;
}
