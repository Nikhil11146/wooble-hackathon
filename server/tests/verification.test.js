import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { authHeader, registerUser, startTestServer, stopTestServer, uniqueEmail } from "./helpers/testSetup.js";

let api;
let worker;
let admin;
let workerSkillId;

before(async () => {
  api = await startTestServer();

  worker = await registerUser(api, { email: uniqueEmail("ver-worker"), password: "StrongPass1!", role: "WORKER", name: "Ver Worker" });
  admin = await registerUser(api, { email: uniqueEmail("ver-admin"), password: "StrongPass1!", role: "ADMIN" });

  // Give the worker a self-declared skill to verify.
  const addSkill = await api
    .post(`/api/workers/${worker.user.id}/skills`)
    .set(authHeader(worker.token))
    .send({ name: "Welding" });
  workerSkillId = addSkill.body.data.find((s) => s.name === "Welding")?._id;
});

after(async () => {
  await stopTestServer();
});

describe("Verification workflow", () => {
  it("allows a worker to request verification (workerId derived from token)", async () => {
    const res = await api
      .post("/api/verifications/request")
      .set(authHeader(worker.token))
      .send({ skillName: "Welding", skillId: workerSkillId });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.workerId, worker.user.id);
    assert.equal(res.body.data.verificationStatus, "PENDING");
  });

  it("rejects a verification request without a token", async () => {
    const res = await api.post("/api/verifications/request").send({ skillName: "Welding" });
    assert.equal(res.status, 401);
  });

  it("lists pending verifications for an admin", async () => {
    const res = await api.get("/api/admin/verifications").set(authHeader(admin.token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1, "expected at least one pending verification");
  });

  it("blocks non-admins from approving verification", async () => {
    const list = await api.get("/api/admin/verifications").set(authHeader(admin.token));
    const verificationId = list.body.data[0]._id;
    const res = await api
      .put(`/api/admin/verifications/${verificationId}/approve`)
      .set(authHeader(worker.token));
    assert.equal(res.status, 403);
  });

  it("lets an admin approve a verification", async () => {
    const list = await api.get("/api/admin/verifications").set(authHeader(admin.token));
    const verificationId = list.body.data[0]._id;
    const res = await api
      .put(`/api/admin/verifications/${verificationId}/approve`)
      .set(authHeader(admin.token))
      .send({ notes: "verified documents" });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.verificationStatus, "APPROVED");
  });

  it("reflects approved verification on the worker profile skill", async () => {
    const res = await api.get(`/api/workers/${worker.user.id}`);
    assert.equal(res.status, 200);
    const skill = res.body.data.skills.find((s) => s.name === "Welding");
    assert.ok(skill);
    assert.equal(skill.verificationStatus, "APPROVED");
  });
});
