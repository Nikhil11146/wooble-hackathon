import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./auth.context";
import * as authService from "../services/auth.service.js";
import * as employerService from "../services/employer.service.js";
import * as workerService from "../services/worker.service.js";
import { connectSocket, disconnectSocket } from "../services/socket.service.js";
import {
  clearSession,
  getDashboardPath,
  getProfileId,
  getStoredProfile,
  getStoredUser,
  isAuthenticated as hasStoredSession,
  setSession as persistSession,
  updateStoredProfile,
} from "../utils/auth.js";

async function fetchProfileForRole(user) {
  if (!user) return null;
  if (user.role === "WORKER") return workerService.getMyProfile();
  if (user.role === "EMPLOYER") return employerService.getMyProfile();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const storedUser = getStoredUser();
    if (!hasStoredSession()) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(storedUser);
    setProfile(getStoredProfile());
    connectSocket();

    try {
      const freshProfile = await fetchProfileForRole(storedUser);
      if (freshProfile) {
        setProfile(freshProfile);
        updateStoredProfile(freshProfile);
      }
    } catch {
      // Keep cached session if profile refresh fails.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) bootstrap().catch(() => undefined);
    });
    return () => {
      active = false;
    };
  }, [bootstrap]);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setProfile(session.profile || null);
    connectSocket();
    return session;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await authService.register(payload);
    setUser(session.user);
    setProfile(session.profile || null);
    connectSocket();
    return session;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    disconnectSocket();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentUser = getStoredUser();
    const freshProfile = await fetchProfileForRole(currentUser);
    if (freshProfile) {
      setProfile(freshProfile);
      updateStoredProfile(freshProfile);
    }
    return freshProfile;
  }, []);

  const updateProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
    updateStoredProfile(nextProfile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      profileId: getProfileId() || profile?._id || profile?.id || null,
      loading,
      isAuthenticated: Boolean(user),
      dashboardPath: getDashboardPath(user?.role),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      persistAuthSession: (session) => {
        persistSession(session);
        if (session.user) setUser(session.user);
        if (session.profile) setProfile(session.profile);
      },
      clearSession: () => {
        clearSession();
        setUser(null);
        setProfile(null);
      },
    }),
    [user, profile, loading, login, register, logout, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
