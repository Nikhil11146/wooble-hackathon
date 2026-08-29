import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "KaushalSetu API is running.",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

export const startServer = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("Database connected.");

    return app.listen(ENV.PORT, () => {
      console.log(`Server listening on port ${ENV.PORT}.`);
    });
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
