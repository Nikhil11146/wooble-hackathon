import { Server } from "socket.io";
import { ENV } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

let io = null;

const allowedOrigins = ENV.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const setupSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.includes("*") ? true : allowedOrigins,
      credentials: true,
    },
  });

  // Every connection must authenticate with a valid access token
  // carried in the handshake (`{ auth: { token } }`).
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication token is required."));

    try {
      const decoded = verifyToken(token);
      if (!decoded?.id) return next(new Error("Invalid authentication token."));
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      return next();
    } catch (_error) {
      return next(new Error("Invalid or expired authentication token."));
    }
  });

  io.on("connection", (socket) => {
    // Room per user id so events can be targeted at a single user.
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${String(userId)}`).emit(event, payload);
};