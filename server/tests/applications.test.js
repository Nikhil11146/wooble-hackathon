import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let worker;
let otherWorker;
let employer;
let jobId;
let job2Id;

const createJob = async (title) => {
  const res = await api
    .post(`/api/employers/${employer.user.id}/jobs`)
    .set(authHeader(employer.token))
    .send({ title, description: "Help" });
  assert.equal(res.status, 201);
  return res.body.data._id;
};

before(async () => {
  api = await startTestServer();

  worker = await registerUser(api, { email: uniqueEmail("app-worker"), password: "StrongPass1!", role: "WORKER", name: "App Worker" });
  otherWorker = await registerUser(api, { email: uniqueEmail("app-other"), password: "StrongPass1!", role: "WORKER", name: "Other Worker" });
  employer = await registerUser(api, { email: uniqueEmail("app-employer"), password: "StrongPass1!", role: "EMPLOYER", companyName: "App Corp" });

  jobId = await createJob("Helper One");
  job2Id = await createJob("Helper Two");
});

after(async () => {
  await stopTestServer();
});

describe("Job applications", () => {
  it("creates an application deriving the worker identity from the token", async () => {
    const res = await api
      .post("/api/applications")
      .set(authHeader(worker.token))
      .send({ jobId });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.workerId, worker.user.id);
  });

  it("ignores a spoofed workerId in the request body (identity comes from the token)", async () => {
    const res = await api
      .post("/api/applications")
      .set(authHeader(worker.token))
      .send({ jobId: job2Id, workerId: otherWorker.user.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.workerId, worker.user.id, "application must be attributed to the authenticated user");
    assert.notEqual(res.body.data.workerId, otherWorker.user.id, "spoofed workerId must not be honored");

    // The spoofed worker should still be able to apply freely (no application was created on their behalf).
    const otherApply = await api
      .post("/api/applications")
      .set(authHeader(otherWorker.token))
      .send({ jobId: job2Id });
    assert.equal(otherApply.status, 201);
    assert.equal(otherApply.body.data.workerId, otherWorker.user.id);
  });

  it("does not let one worker list another worker's applications", async () => {
    const res = await api
      .get(`/api/workers/${otherWorker.user.id}/applications`)
      .set(authHeader(worker.token));
    assert.equal(res.status, 403);
  });

  it("returns the authenticated worker's applications", async () => {
    const res = await api
      .get(`/api/workers/${worker.user.id}/applications`)
      .set(authHeader(worker.token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 2, "expected both applications");
  });
});
