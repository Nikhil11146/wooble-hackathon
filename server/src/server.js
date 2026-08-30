import cors from "cors";
import express from "express";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { API_PREFIX, APP_NAME, DATABASE_STATES, REQUEST_BODY_LIMIT } from "./config/constants.js";
import { connectDatabase, getDatabaseState } from "./config/database.js";
import { ENV } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rate-limit.middleware.js";
import "./models/index.js";
import apiRoutes from "./routes/index.js";
import { setupSocketServer } from "./sockets/socket.server.js";

const app = express();
const allowedOrigins = ENV.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: `${APP_NAME} is running.`,
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({  
    success: true,
    database: DATABASE_STATES[getDatabaseState()] || "unknown",
  });
});

app.use(API_PREFIX, apiLimiter);
app.use(API_PREFIX, apiRoutes);
app.use(notFound);
app.use(errorHandler);

export const startServer = async () => {
  try {
    await connectDatabase();
    console.log("Database connected.");

    const server = app.listen(ENV.PORT, () => {
      console.log(`Server listening on port ${ENV.PORT}.`);
    });

    setupSocketServer(server);
    return server;
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
    return null;
  }
};

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : null;

if (currentFile === invokedFile) {
  startServer();
}

export default app;
