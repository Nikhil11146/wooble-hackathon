import { API_BASE_URL, AUTH_EVENTS } from "../utils/constants.js";
import { clearSession, getRefreshToken, getToken, setSession } from "../utils/auth.js";

class ApiError extends Error {
  constructor(message, status, payload = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let refreshPromise = null;

function notifyAuthExpired() {
  clearSession();
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS.EXPIRED));
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError("Session expired.", 401);

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success) {
          notifyAuthExpired();
          throw new ApiError(payload.message || "Session expired.", response.status, payload);
        }
        setSession({
          token: payload.data.token,
          refreshToken: payload.data.refreshToken,
        });
        return payload.data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new ApiError(payload.message || "Request failed.", response.status, payload);
  }
  return payload;
}

function buildUrl(path, params) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") search.set(key, value);
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

const DEFAULT_TIMEOUT = 15000;

async function request(path, options = {}, retry = true) {
  const { params, body, headers: customHeaders, timeout = DEFAULT_TIMEOUT, ...restOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(customHeaders || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${buildUrl(path, params)}`, {
      ...restOptions,
      headers,
      body,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 && retry) {
    if (getRefreshToken()) {
      const newToken = await refreshAccessToken();
      return request(
        path,
        {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        },
        false,
      );
    }
    if (token) notifyAuthExpired();
  }

  return parseResponse(response);
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, {
      ...options,
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
    }),
  put: (path, body, options) =>
    request(path, {
      ...options,
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined,
    }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export { ApiError };

export default api;
