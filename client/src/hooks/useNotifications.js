import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationsContext = createContext(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotificationsProvider({ children, autoDismissMs = 5000 }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = "info", message, title, duration = autoDismissMs }) => {
      const id = createId();
      const notification = { id, type, message, title };

      setNotifications((current) => [...current, notification]);

      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [autoDismissMs, dismiss],
  );

  const value = useMemo(
    () => ({
      notifications,
      notify,
      dismiss,
      success: (message, options = {}) => notify({ ...options, type: "success", message }),
      error: (message, options = {}) => notify({ ...options, type: "error", message }),
      info: (message, options = {}) => notify({ ...options, type: "info", message }),
      warning: (message, options = {}) => notify({ ...options, type: "warning", message }),
      clearAll: () => setNotifications([]),
    }),
    [notifications, notify, dismiss],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export default function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider.");
  }
  return context;
}
