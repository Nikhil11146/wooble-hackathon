import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, loginAndToken, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let workerSession;
let employerSession;

before(async () => {
  api = await startTestServer();

  workerSession = await registerUser(api, {
    email: uniqueEmail("perm-worker"),
    password: "StrongPass1!",
    role: "WORKER",
    name: "Perm Worker",
  });

  employerSession = await registerUser(api, {
    email: uniqueEmail("perm-employer"),
    password: "StrongPass1!",
    role: "EMPLOYER",
    companyName: "Perm Corp",
  });
});

after(async () => {
  await stopTestServer();
});

describe("Permissions / role guards", () => {
  it("rejects requests without a token", async () => {
    const res = await api.get("/api/workers/me");
    assert.equal(res.status, 401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await api.get("/api/workers/me").set("Authorization", "Bearer not-a-real-token");
    assert.equal(res.status, 401);
  });

  it("allows a worker to reach a worker route", async () => {
    const res = await api.get("/api/workers/me").set(authHeader(workerSession.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, "Perm Worker");
  });

  it("blocks a worker from employer routes (403)", async () => {
    const res = await api.get("/api/employers/me").set(authHeader(workerSession.token));
    assert.equal(res.status, 403);
  });

  it("blocks an employer from worker create routes (403)", async () => {
    const res = await api.post("/api/workers/someid/skills").send({ name: "Coding" }).set(authHeader(employerSession.token));
    assert.equal(res.status, 403);
  });

  it("blocks non-admin from admin routes (403)", async () => {
    const res = await api.get("/api/admin/users").set(authHeader(workerSession.token));
    assert.equal(res.status, 403);
  });

  it("returns 401 for wrong credentials when logging in", async () => {
    const res = await api.post("/api/auth/login").send({
      email: uniqueEmail("nouser"),
      password: "WrongPass1!",
    });
    assert.equal(res.status, 401);
  });
});
