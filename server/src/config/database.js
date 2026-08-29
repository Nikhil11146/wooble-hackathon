import mongoose from "mongoose";
import { ENV } from "./env.js";

let connectionPromise;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(ENV.MONGODB_URI)
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  return connectionPromise;
};

export const disconnectDatabase = () => mongoose.disconnect();
export const getDatabaseState = () => mongoose.connection.readyState;
