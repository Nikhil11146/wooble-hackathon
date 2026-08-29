const write = (level, message, metadata) => {
  const entry = { timestamp: new Date().toISOString(), level, message, ...(metadata && { metadata }) };
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](JSON.stringify(entry));
};

export const logger = Object.freeze({ info: (message, metadata) => write("info", message, metadata), warn: (message, metadata) => write("warn", message, metadata), error: (message, metadata) => write("error", message, metadata) });
