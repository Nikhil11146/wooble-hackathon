import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

let mongo;
let server;

/** Boots an in-memory MongoDB plus the express app. Returns a supertest agent. */
export const startTestServer = async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("kaushalsetu_test");
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-access-secret-not-for-production";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-not-for-production";

  const { default: app } = await import("../../src/server.js");
  const { connectDatabase } = await import("../../src/config/database.js");

  await connectDatabase();

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  return request(app);
};

export const stopTestServer = async () => {
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
      for (const socket of server._connections || []) socket?.destroy?.();
    });
  }
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};

export const registerUser = async (api, { email, password, role, name, companyName }) => {
  const body = { email, password, role };
  if (name) body.name = name;
  if (companyName) body.companyName = companyName;
  const res = await api.post("/api/auth/register").send(body);
  if (res.status !== 201) {
    throw new Error(`register failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body.data;
};

export const loginAndToken = async (api, { email, password }) => {
  const res = await api.post("/api/auth/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const uniqueEmail = (prefix = "worker") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
