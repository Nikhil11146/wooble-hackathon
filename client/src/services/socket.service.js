import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants.js";
import { getToken } from "../utils/auth.js";

let socket = null;

function currentSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    socket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error.message);
    });
  }
  return socket;
}

export function connectSocket() {
  const target = currentSocket();
  target.auth = { token: getToken() };
  target.connect();
  return target;
}

export function disconnectSocket() {
  socket?.disconnect();
}

export function onSocketEvent(event, callback) {
  const target = currentSocket();
  if (!target.connected) connectSocket();
  target.on(event, callback);
  return () => target.off(event, callback);
}