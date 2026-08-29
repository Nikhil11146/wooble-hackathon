import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants.js";
import { getToken } from "../utils/auth.js";

let socket = null;

function currentSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      // Auth is re-read on every (re)connect so a refreshed token always works.
      auth: (callback) => callback({ token: getToken() }),
    });
    socket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error.message);
    });
  }
  return socket;
}

export function connectSocket() {
  return currentSocket().connect();
}

export function disconnectSocket() {
  socket?.disconnect();
}

export function onSocketEvent(event, callback) {
  const target = currentSocket();
  if (!target.connected) target.connect();
  target.on(event, callback);
  return () => target.off(event, callback);
}

export function onSocketConnect(callback) {
  const target = currentSocket();
  if (!target.connected) target.connect();
  target.on("connect", callback);
  return () => target.off("connect", callback);
}